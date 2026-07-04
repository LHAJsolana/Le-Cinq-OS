"use server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod, TableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const active={notIn:[OrderStatus.PAID,OrderStatus.CANCELLED]};
async function recalc(orderId:number){const items=await prisma.orderItem.findMany({where:{orderId}}); const total=items.reduce((s,i)=>s+i.quantity*i.unitPrice,0); await prisma.order.update({where:{id:orderId},data:{total}})}
export async function addItem(form:FormData){
 const tableId=Number(form.get("tableId")), menuItemId=Number(form.get("menuItemId")), quantity=Number(form.get("quantity")||1); const waiterId=Number(form.get("waiterId")||0)||undefined;
 const item=await prisma.menuItem.findUniqueOrThrow({where:{id:menuItemId}}); let order=await prisma.order.findFirst({where:{tableId,status:active},orderBy:{createdAt:"desc"}});
 if(!order){const waiter=waiterId?await prisma.waiter.findUnique({where:{id:waiterId}}):null; order=await prisma.order.create({data:{tableId,waiterId,waiterName:waiter?.name||"Mostafa"}})}
 const options=String(form.get("options")||""); await prisma.orderItem.create({data:{orderId:order.id,menuItemId,nameSnapshot:item.name,quantity,unitPrice:item.price,notes:String(form.get("notes")||""),options:JSON.stringify(options?options.split("|"):[])}}); await recalc(order.id); await prisma.cafeTable.update({where:{id:tableId},data:{status:TableStatus.ORDERING}}); revalidatePath(`/service/tables/${tableId}`); revalidatePath("/service");
}
export async function removeItem(form:FormData){const id=Number(form.get("id")); const row=await prisma.orderItem.delete({where:{id}}); await recalc(row.orderId); revalidatePath("/service");}
const map:Record<OrderStatus,TableStatus|undefined>={DRAFT:TableStatus.ORDERING,SENT:TableStatus.SENT,ACCEPTED:TableStatus.SENT,PREPARING:TableStatus.PREPARING,READY:TableStatus.READY,SERVED:TableStatus.SERVED,PAYMENT_REQUESTED:TableStatus.PAYMENT_REQUESTED,PAID:TableStatus.PAID,CANCELLED:TableStatus.FREE};
export async function setOrderStatus(form:FormData){const orderId=Number(form.get("orderId")); const status=String(form.get("status")) as OrderStatus; const order=await prisma.order.findUniqueOrThrow({where:{id:orderId},include:{items:true}}); if(status===OrderStatus.SENT&&order.items.length===0) return; await prisma.$transaction([prisma.order.update({where:{id:orderId},data:{status}}),prisma.cafeTable.update({where:{id:order.tableId},data:{status:map[status]}})]); revalidatePath("/service");revalidatePath("/bar");revalidatePath("/caisse");revalidatePath(`/service/tables/${order.tableId}`);}
export async function markPaid(form:FormData){const orderId=Number(form.get("orderId")); const method=String(form.get("method")) as PaymentMethod; if(!Object.values(PaymentMethod).includes(method)) return; const order=await prisma.order.update({where:{id:orderId},data:{status:OrderStatus.PAID,paymentMethod:method,paidAt:new Date()}}); await prisma.cafeTable.update({where:{id:order.tableId},data:{status:TableStatus.PAID}}); revalidatePath("/caisse");revalidatePath("/service");}
export async function resetTable(form:FormData){const id=Number(form.get("tableId")); await prisma.cafeTable.update({where:{id},data:{status:TableStatus.FREE}}); revalidatePath("/service");revalidatePath("/caisse");}
export async function saveMenuItem(form:FormData){const id=Number(form.get("id")||0); const data={name:String(form.get("name")),price:Number(form.get("price")),categoryId:Number(form.get("categoryId")),isAvailable:form.get("isAvailable")==="on"}; if(id) await prisma.menuItem.update({where:{id},data}); else await prisma.menuItem.create({data}); revalidatePath("/admin");}
export async function deleteMenuItem(form:FormData){await prisma.menuItem.update({where:{id:Number(form.get("id"))},data:{isActive:false}});revalidatePath("/admin");}
export async function toggleTable(form:FormData){const id=Number(form.get("id")), isActive=form.get("active")==="true"; await prisma.cafeTable.update({where:{id},data:{isActive:!isActive}});revalidatePath("/admin");}
export async function addTable(){const last=await prisma.cafeTable.findFirst({orderBy:{number:"desc"}}); await prisma.cafeTable.create({data:{number:(last?.number||0)+1}});revalidatePath("/admin");}
