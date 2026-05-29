// @ts-nocheck
import { PrismaClient } from '@prisma/client';
// @ts-nocheck
import { format } from 'date-fns';
// @ts-nocheck

// @ts-nocheck
const prisma = new PrismaClient();
// @ts-nocheck

// @ts-nocheck
export const STATE_CODES: Record<string, string> = {
// @ts-nocheck
  "01": "Jammu and Kashmir",
// @ts-nocheck
  "02": "Himachal Pradesh",
// @ts-nocheck
  "03": "Punjab",
// @ts-nocheck
  "04": "Chandigarh",
// @ts-nocheck
  "05": "Uttarakhand",
// @ts-nocheck
  "06": "Haryana",
// @ts-nocheck
  "07": "Delhi",
// @ts-nocheck
  "08": "Rajasthan",
// @ts-nocheck
  "09": "Uttar Pradesh",
// @ts-nocheck
  "10": "Bihar",
// @ts-nocheck
  "11": "Sikkim",
// @ts-nocheck
  "12": "Arunachal Pradesh",
// @ts-nocheck
  "13": "Nagaland",
// @ts-nocheck
  "14": "Manipur",
// @ts-nocheck
  "15": "Mizoram",
// @ts-nocheck
  "16": "Tripura",
// @ts-nocheck
  "17": "Meghalaya",
// @ts-nocheck
  "18": "Assam",
// @ts-nocheck
  "19": "West Bengal",
// @ts-nocheck
  "20": "Jharkhand",
// @ts-nocheck
  "21": "Odisha",
// @ts-nocheck
  "22": "Chhattisgarh",
// @ts-nocheck
  "23": "Madhya Pradesh",
// @ts-nocheck
  "24": "Gujarat",
// @ts-nocheck
  "25": "Daman and Diu",
// @ts-nocheck
  "26": "Dadra and Nagar Haveli and Daman and Diu",
// @ts-nocheck
  "27": "Maharashtra",
// @ts-nocheck
  "29": "Karnataka",
// @ts-nocheck
  "30": "Goa",
// @ts-nocheck
  "31": "Lakshadweep",
// @ts-nocheck
  "32": "Kerala",
// @ts-nocheck
  "33": "Tamil Nadu",
// @ts-nocheck
  "34": "Pondicherry",
// @ts-nocheck
  "35": "Andaman and Nicobar Islands",
// @ts-nocheck
  "36": "Telangana",
// @ts-nocheck
  "37": "Andhra Pradesh",
// @ts-nocheck
  "38": "Ladakh",
// @ts-nocheck
  "97": "Other Territory"
// @ts-nocheck
};
// @ts-nocheck

// @ts-nocheck
export class GstService {
// @ts-nocheck
  /**
// @ts-nocheck
   * Generates GSTR-1 JSON for a given period and user
// @ts-nocheck
   */
// @ts-nocheck
  async generateGstr1Json(userId: string, month: number, year: number) {
// @ts-nocheck
    const startDate = new Date(year, month - 1, 1);
// @ts-nocheck
    const endDate = new Date(year, month, 0, 23, 59, 59);
// @ts-nocheck

// @ts-nocheck
    const user = await prisma.user.findUnique({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      select: { gstNumber: true, companyName: true }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!user?.gstNumber) {
// @ts-nocheck
      throw new Error('GST Number not configured for user');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const bills = await prisma.bill.findMany({
// @ts-nocheck
      where: {
// @ts-nocheck
        userId,
// @ts-nocheck
        createdAt: {
// @ts-nocheck
          gte: startDate,
// @ts-nocheck
          lte: endDate
// @ts-nocheck
        },
// @ts-nocheck
        status: { not: 'DRAFT' } // Exclude drafts
// @ts-nocheck
      },
// @ts-nocheck
      include: {
// @ts-nocheck
        items: true,
// @ts-nocheck
        customer: true
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    const gstr1: any = {
// @ts-nocheck
      gstin: user.gstNumber,
// @ts-nocheck
      fp: format(startDate, 'MMyyyy'),
// @ts-nocheck
      gt: 0, // Should be calculated or fetched from profile
// @ts-nocheck
      cur_gt: 0,
// @ts-nocheck
      b2b: [],
// @ts-nocheck
      b2ba: [],
// @ts-nocheck
      b2cl: [],
// @ts-nocheck
      b2cla: [],
// @ts-nocheck
      b2cs: [],
// @ts-nocheck
      b2csa: [],
// @ts-nocheck
      cdnr: [],
// @ts-nocheck
      cdnra: [],
// @ts-nocheck
      cdnur: [],
// @ts-nocheck
      cdnura: [],
// @ts-nocheck
      exp: [],
// @ts-nocheck
      expa: [],
// @ts-nocheck
      at: [],
// @ts-nocheck
      ata: [],
// @ts-nocheck
      atadj: [],
// @ts-nocheck
      atadja: [],
// @ts-nocheck
      exemp: [],
// @ts-nocheck
      hsn: { det: [] },
// @ts-nocheck
      doc_issue: { doc_det: [] }
// @ts-nocheck
    };
// @ts-nocheck

// @ts-nocheck
    // Grouping logic for B2B, B2CL, B2CS
// @ts-nocheck
    const b2bMap = new Map<string, any>();
// @ts-nocheck
    const hsnMap = new Map<string, any>();
// @ts-nocheck

// @ts-nocheck
    bills.forEach(bill => {
// @ts-nocheck
      const isRegistered = !!bill.customer?.gstNumber;
// @ts-nocheck
      const amount = bill.totalAmount;
// @ts-nocheck
      const stateCode = bill.placeOfSupply?.substring(0, 2) || user.gstNumber?.substring(0, 2) || "00";
// @ts-nocheck

// @ts-nocheck
      if (isRegistered) {
// @ts-nocheck
        // B2B Logic
// @ts-nocheck
        const ctin = bill.customer!.gstNumber!;
// @ts-nocheck
        if (!b2bMap.has(ctin)) {
// @ts-nocheck
          b2bMap.set(ctin, { ctin, inv: [] });
// @ts-nocheck
        }
// @ts-nocheck
        
// @ts-nocheck
        const inv = {
// @ts-nocheck
          inum: bill.billNumber,
// @ts-nocheck
          idt: format(bill.createdAt, 'dd-MM-yyyy'),
// @ts-nocheck
          val: bill.totalAmount,
// @ts-nocheck
          pos: stateCode,
// @ts-nocheck
          rchrg: bill.reverseCharge ? 'Y' : 'N',
// @ts-nocheck
          inv_typ: 'R', // Regular for now
// @ts-nocheck
          itms: this.formatItems(bill.items)
// @ts-nocheck
        };
// @ts-nocheck
        b2bMap.get(ctin).inv.push(inv);
// @ts-nocheck
      } else {
// @ts-nocheck
        // B2CS (Small) or B2CL (Large) logic
// @ts-nocheck
        // Threshold for B2CL is 2.5 Lakhs AND interstate
// @ts-nocheck
        if (bill.totalAmount > 250000 && bill.isInterstate) {
// @ts-nocheck
          gstr1.b2cl.push({
// @ts-nocheck
            pos: stateCode,
// @ts-nocheck
            inv: [{
// @ts-nocheck
              inum: bill.billNumber,
// @ts-nocheck
              idt: format(bill.createdAt, 'dd-MM-yyyy'),
// @ts-nocheck
              val: bill.totalAmount,
// @ts-nocheck
              itms: this.formatItems(bill.items)
// @ts-nocheck
            }]
// @ts-nocheck
          });
// @ts-nocheck
        } else {
// @ts-nocheck
          // B2CS logic (simplified group by POS and Rate)
// @ts-nocheck
          // For now, adding individual items to at least capture data
// @ts-nocheck
          // Professional GST tools usually group B2CS by POS and Tax Rate
// @ts-nocheck
          bill.items.forEach(item => {
// @ts-nocheck
             const rate = item.taxRate || 0;
// @ts-nocheck
             const pos = stateCode;
// @ts-nocheck
             const key = `${pos}_${rate}`;
// @ts-nocheck
             
// @ts-nocheck
             let b2csEntry = gstr1.b2cs.find((e: any) => e.pos === pos && e.rt === rate);
// @ts-nocheck
             if (!b2csEntry) {
// @ts-nocheck
                 b2csEntry = {
// @ts-nocheck
                     pos,
// @ts-nocheck
                     rt: rate,
// @ts-nocheck
                     txval: 0,
// @ts-nocheck
                     iamt: 0,
// @ts-nocheck
                     camt: 0,
// @ts-nocheck
                     samt: 0,
// @ts-nocheck
                     csamt: 0,
// @ts-nocheck
                     sply_ty: bill.isInterstate ? 'INTER' : 'INTRA'
// @ts-nocheck
                 };
// @ts-nocheck
                 gstr1.b2cs.push(b2csEntry);
// @ts-nocheck
             }
// @ts-nocheck
             
// @ts-nocheck
             b2csEntry.txval += Number(item.total) - Number(item.taxAmount || 0);
// @ts-nocheck
             if (bill.isInterstate) {
// @ts-nocheck
                 b2csEntry.iamt += Number(item.igstAmount || 0);
// @ts-nocheck
             } else {
// @ts-nocheck
                 b2csEntry.camt += Number(item.cgstAmount || 0);
// @ts-nocheck
                 b2csEntry.samt += Number(item.sgstAmount || 0);
// @ts-nocheck
             }
// @ts-nocheck
             b2csEntry.csamt += Number(item.cessAmount || 0);
// @ts-nocheck
          });
// @ts-nocheck
        }
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // HSN Summary logic
// @ts-nocheck
      bill.items.forEach(item => {
// @ts-nocheck
        if (!item.hsnCode) return;
// @ts-nocheck
        if (!hsnMap.has(item.hsnCode)) {
// @ts-nocheck
          hsnMap.set(item.hsnCode, {
// @ts-nocheck
            hsn_sc: item.hsnCode,
// @ts-nocheck
            desc: item.productName,
// @ts-nocheck
            uqc: item.custom_fields ? (JSON.parse(item.custom_fields as string)?.unit || 'NOS') : 'NOS',
// @ts-nocheck
            qty: 0,
// @ts-nocheck
            val: 0,
// @ts-nocheck
            txval: 0,
// @ts-nocheck
            iamt: 0,
// @ts-nocheck
            camt: 0,
// @ts-nocheck
            samt: 0,
// @ts-nocheck
            csamt: 0
// @ts-nocheck
          });
// @ts-nocheck
        }
// @ts-nocheck
        const h = hsnMap.get(item.hsnCode);
// @ts-nocheck
        h.qty += Number(item.quantity);
// @ts-nocheck
        h.val += Number(item.total);
// @ts-nocheck
        h.txval += Number(item.total) - Number(item.taxAmount || 0);
// @ts-nocheck
        h.iamt += Number(item.igstAmount || 0);
// @ts-nocheck
        h.camt += Number(item.cgstAmount || 0);
// @ts-nocheck
        h.samt += Number(item.sgstAmount || 0);
// @ts-nocheck
        h.csamt += Number(item.cessAmount || 0);
// @ts-nocheck
      });
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    gstr1.b2b = Array.from(b2bMap.values());
// @ts-nocheck
    gstr1.hsn.det = Array.from(hsnMap.values());
// @ts-nocheck
    
// @ts-nocheck
    // Document Issued Logic
// @ts-nocheck
    if (bills.length > 0) {
// @ts-nocheck
        const sortedBills = [...bills].sort((a, b) => a.billNumber.localeCompare(b.billNumber));
// @ts-nocheck
        gstr1.doc_issue.doc_det.push({
// @ts-nocheck
            doc_num: 1, // Invoices for outward supply
// @ts-nocheck
            docs: [{
// @ts-nocheck
                from: sortedBills[0].billNumber,
// @ts-nocheck
                to: sortedBills[sortedBills.length - 1].billNumber,
// @ts-nocheck
                totnum: bills.length,
// @ts-nocheck
                cancel: bills.filter(b => b.status === 'CANCELLED').length,
// @ts-nocheck
                net_issue: bills.filter(b => b.status !== 'CANCELLED').length
// @ts-nocheck
            }]
// @ts-nocheck
        });
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return gstr1;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Searches for HSN/SAC codes in the master database
// @ts-nocheck
   */
// @ts-nocheck
  async searchHsn(query: string) {
// @ts-nocheck
    // Lazy load the big JSON file
// @ts-nocheck
    const hsnData = require('../data/hsn.json').data;
// @ts-nocheck
    const q = query.toLowerCase().trim();
// @ts-nocheck
    if (!q) return [];
// @ts-nocheck
    
// @ts-nocheck
    return hsnData.filter((h: any) => 
// @ts-nocheck
      h.c.toLowerCase().includes(q) || 
// @ts-nocheck
      h.n.toLowerCase().includes(q)
// @ts-nocheck
    ).slice(0, 50); // Return top 50 matches
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generates GSTR-2 JSON (Purchases) for a given period and user
// @ts-nocheck
   */
// @ts-nocheck
  async generateGstr2Json(userId: string, month: number, year: number) {
// @ts-nocheck
    const startDate = new Date(year, month - 1, 1);
// @ts-nocheck
    const endDate = new Date(year, month, 0, 23, 59, 59);
// @ts-nocheck

// @ts-nocheck
    const user = await prisma.user.findUnique({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      select: { gstNumber: true }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    const pos = await prisma.purchaseOrder.findMany({
// @ts-nocheck
      where: {
// @ts-nocheck
        userId,
// @ts-nocheck
        orderDate: {
// @ts-nocheck
          gte: startDate,
// @ts-nocheck
          lte: endDate
// @ts-nocheck
        },
// @ts-nocheck
        status: { in: ['ORDERED', 'RECEIVED'] }
// @ts-nocheck
      },
// @ts-nocheck
      include: {
// @ts-nocheck
        items: true,
// @ts-nocheck
        supplier: true
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    const gstr2: any = {
// @ts-nocheck
      gstin: user?.gstNumber,
// @ts-nocheck
      fp: format(startDate, 'MMyyyy'),
// @ts-nocheck
      b2b: [],
// @ts-nocheck
      hsnsum: { det: [] }
// @ts-nocheck
    };
// @ts-nocheck

// @ts-nocheck
    const b2bMap = new Map<string, any>();
// @ts-nocheck
    const hsnMap = new Map<string, any>();
// @ts-nocheck

// @ts-nocheck
    pos.forEach(order => {
// @ts-nocheck
      const ctin = order.supplier?.gstNumber;
// @ts-nocheck
      if (!ctin) return; // Only registered suppliers for B2B GSTR-2
// @ts-nocheck

// @ts-nocheck
      if (!b2bMap.has(ctin)) {
// @ts-nocheck
        b2bMap.set(ctin, { ctin, inv: [] });
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      const inv = {
// @ts-nocheck
        inum: order.poNumber,
// @ts-nocheck
        idt: format(order.orderDate, 'dd-MM-yyyy'),
// @ts-nocheck
        val: order.totalAmount,
// @ts-nocheck
        pos: order.supplier.stateCode || user?.gstNumber?.substring(0, 2) || "01",
// @ts-nocheck
        rchrg: 'N',
// @ts-nocheck
        inv_typ: 'R',
// @ts-nocheck
        itms: order.items.map((item, idx) => ({
// @ts-nocheck
          num: idx + 1,
// @ts-nocheck
          itm_det: {
// @ts-nocheck
            rt: item.taxRate || 0,
// @ts-nocheck
            txval: item.total - (item.taxAmount || 0),
// @ts-nocheck
            iamt: item.igstAmount || 0,
// @ts-nocheck
            camt: item.cgstAmount || 0,
// @ts-nocheck
            samt: item.sgstAmount || 0,
// @ts-nocheck
            csamt: 0
// @ts-nocheck
          }
// @ts-nocheck
        }))
// @ts-nocheck
      };
// @ts-nocheck
      b2bMap.get(ctin).inv.push(inv);
// @ts-nocheck

// @ts-nocheck
      // HSN Summary
// @ts-nocheck
      order.items.forEach(item => {
// @ts-nocheck
        if (!item.hsnCode) return;
// @ts-nocheck
        if (!hsnMap.has(item.hsnCode)) {
// @ts-nocheck
          hsnMap.set(item.hsnCode, {
// @ts-nocheck
            hsn_sc: item.hsnCode,
// @ts-nocheck
            desc: item.productName,
// @ts-nocheck
            uqc: 'NOS',
// @ts-nocheck
            qty: 0,
// @ts-nocheck
            val: 0,
// @ts-nocheck
            txval: 0,
// @ts-nocheck
            iamt: 0,
// @ts-nocheck
            camt: 0,
// @ts-nocheck
            samt: 0,
// @ts-nocheck
            csamt: 0
// @ts-nocheck
          });
// @ts-nocheck
        }
// @ts-nocheck
        const h = hsnMap.get(item.hsnCode);
// @ts-nocheck
        h.qty += Number(item.quantity);
// @ts-nocheck
        h.val += Number(item.total);
// @ts-nocheck
        h.txval += Number(item.total) - Number(item.taxAmount || 0);
// @ts-nocheck
        h.iamt += Number(item.igstAmount || 0);
// @ts-nocheck
        h.camt += Number(item.cgstAmount || 0);
// @ts-nocheck
        h.samt += Number(item.sgstAmount || 0);
// @ts-nocheck
      });
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    gstr2.b2b = Array.from(b2bMap.values());
// @ts-nocheck
    gstr2.hsnsum.det = Array.from(hsnMap.values());
// @ts-nocheck

// @ts-nocheck
    return gstr2;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generates a high-level GSTR-3B summary for the period
// @ts-nocheck
   */
// @ts-nocheck
  async getGstr3bSummary(userId: string, month: number, year: number) {
// @ts-nocheck
    const gstr1 = await this.generateGstr1Json(userId, month, year);
// @ts-nocheck
    const gstr2 = await this.generateGstr2Json(userId, month, year);
// @ts-nocheck

// @ts-nocheck
    // Summary calculation
// @ts-nocheck
    const summary = {
// @ts-nocheck
      outward: {
// @ts-nocheck
        taxable_val: 0,
// @ts-nocheck
        iamt: 0,
// @ts-nocheck
        camt: 0,
// @ts-nocheck
        samt: 0,
// @ts-nocheck
        csamt: 0
// @ts-nocheck
      },
// @ts-nocheck
      inward_itc: {
// @ts-nocheck
        taxable_val: 0,
// @ts-nocheck
        iamt: 0,
// @ts-nocheck
        camt: 0,
// @ts-nocheck
        samt: 0
// @ts-nocheck
      }
// @ts-nocheck
    };
// @ts-nocheck

// @ts-nocheck
    // Sum up GSTR-1 B2B/B2CS
// @ts-nocheck
    gstr1.b2b.forEach((b: any) => b.inv.forEach((inv: any) => {
// @ts-nocheck
      inv.itms.forEach((itm: any) => {
// @ts-nocheck
        summary.outward.taxable_val += itm.itm_det.txval;
// @ts-nocheck
        summary.outward.iamt += itm.itm_det.iamt;
// @ts-nocheck
        summary.outward.camt += itm.itm_det.camt;
// @ts-nocheck
        summary.outward.samt += itm.itm_det.samt;
// @ts-nocheck
      });
// @ts-nocheck
    }));
// @ts-nocheck
    gstr1.b2cs.forEach((b: any) => {
// @ts-nocheck
      summary.outward.taxable_val += b.txval;
// @ts-nocheck
      summary.outward.iamt += b.iamt;
// @ts-nocheck
      summary.outward.camt += b.camt;
// @ts-nocheck
      summary.outward.samt += b.samt;
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    // Sum up GSTR-2 (ITC)
// @ts-nocheck
    gstr2.b2b.forEach((b: any) => b.inv.forEach((inv: any) => {
// @ts-nocheck
      inv.itms.forEach((itm: any) => {
// @ts-nocheck
        summary.inward_itc.taxable_val += itm.itm_det.txval;
// @ts-nocheck
        summary.inward_itc.iamt += itm.itm_det.iamt;
// @ts-nocheck
        summary.inward_itc.camt += itm.itm_det.camt;
// @ts-nocheck
        summary.inward_itc.samt += itm.itm_det.samt;
// @ts-nocheck
      });
// @ts-nocheck
    }));
// @ts-nocheck

// @ts-nocheck
    return summary;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  private formatItems(items: any[]) {
// @ts-nocheck
    // GST portal expects items grouped by tax rate within an invoice
// @ts-nocheck
    const ratesMap = new Map<number, any>();
// @ts-nocheck
    items.forEach(item => {
// @ts-nocheck
      const rate = item.taxRate || 0;
// @ts-nocheck
      if (!ratesMap.has(rate)) {
// @ts-nocheck
        ratesMap.set(rate, {
// @ts-nocheck
          num: ratesMap.size + 1,
// @ts-nocheck
          itm_det: {
// @ts-nocheck
            rt: rate,
// @ts-nocheck
            txval: 0,
// @ts-nocheck
            iamt: 0,
// @ts-nocheck
            camt: 0,
// @ts-nocheck
            samt: 0,
// @ts-nocheck
            csamt: 0
// @ts-nocheck
          }
// @ts-nocheck
        });
// @ts-nocheck
      }
// @ts-nocheck
      const itm = ratesMap.get(rate).itm_det;
// @ts-nocheck
      itm.txval += Number(item.total) - Number(item.taxAmount || 0);
// @ts-nocheck
      itm.iamt += Number(item.igstAmount || 0);
// @ts-nocheck
      itm.camt += Number(item.cgstAmount || 0);
// @ts-nocheck
      itm.samt += Number(item.sgstAmount || 0);
// @ts-nocheck
      itm.csamt += Number(item.cessAmount || 0);
// @ts-nocheck
    });
// @ts-nocheck
    return Array.from(ratesMap.values());
// @ts-nocheck
  }
// @ts-nocheck
}
