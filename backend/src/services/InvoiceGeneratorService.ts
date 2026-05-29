import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import pdf from 'html-pdf-node';

export interface InvoiceData {
    business: {
        name: string;
        address: string;
        phone: string;
        gst: string;
        logo?: string;
    };
    bill: {
        number: string;
        date: string;
        customerName: string;
        customerAddress: string;
        customerPhone: string;
        customerGst?: string;
        items: Array<Record<string, any>>; // Flexible for dynamic columns
        subtotal: number;
        taxRate: number;
        taxAmount: number;
        discount: number;
        totalAmount: number;
        paymentMode: string;
        paymentStatus: string;
    };
}

export class InvoiceGeneratorService {
    private static templatesDir = path.join(__dirname, '../templates/invoice');

    /**
     * Generates HTML from a template and data
     */
    public static async generateHTML(templateName: string, data: InvoiceData): Promise<string> {
        const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template ${templateName} not found at ${templatePath}`);
        }

        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, data, (err, html) => {
                if (err) return reject(err);
                resolve(html);
            });
        });
    }

    /**
     * Generates a PDF buffer using pdf-node
     */
    public static async generatePDF(templateName: string, data: InvoiceData, options: any = {}): Promise<Buffer> {
        const html = await this.generateHTML(templateName, data);
        
        const pdfOptions = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            ...options
        };

        const file = { content: html };

        return new Promise((resolve, reject) => {
            pdf.generatePdf(file, pdfOptions, (err: any, pdfBuffer: Buffer) => {
                if (err) return reject(err);
                resolve(pdfBuffer);
            });
        });
    }

    /**
     * Fetches dynamic data for an invoice based on template configuration
     */
    public static async getDynamicInvoiceData(prisma: any, billId: string): Promise<InvoiceData> {
        const bill = await prisma.bill.findUnique({
            where: { id: billId },
            include: {
                user: true,
                customer: true,
                items: {
                    include: {
                        product: true,
                        service: true,
                        tax: true
                    }
                },
                template: true
            }
        });

        if (!bill) throw new Error('Bill not found');

        const template = bill.template;
        const columnConfig = template ? JSON.parse(template.columnConfig) : [];

        const items = bill.items.map((item: any) => {
            const dynamicItem: Record<string, any> = {
                id: item.id,
                name: item.productName || (item.service ? item.service.name : ''),
                qty: Number(item.quantity),
                rate: item.price,
                total: item.total,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount
            };

            // Inject mapped fields based on config
            columnConfig.forEach((col: any) => {
                if (col.dbField) {
                    const value = this.resolveDbField(item, col.dbField);
                    dynamicItem[col.key] = value;
                }
            });

            return dynamicItem;
        });

        return {
            business: {
                name: bill.user.companyName || bill.user.name || 'Your Business',
                address: bill.user.address || '',
                phone: bill.user.phone || '',
                gst: bill.user.gstNumber || '',
                logo: bill.user.logoUrl
            },
            bill: {
                number: bill.billNumber,
                date: bill.createdAt.toLocaleDateString(),
                customerName: bill.customerName,
                customerAddress: bill.customer?.address || '',
                customerPhone: bill.customer?.phone || '',
                customerGst: bill.customer?.gstNumber,
                items,
                subtotal: bill.subtotal,
                taxRate: 0, // Calculated globally if needed
                taxAmount: bill.taxAmount,
                discount: 0, // Add discount field to Bill model if needed
                totalAmount: bill.totalAmount,
                paymentMode: bill.paymentMode || 'Cash',
                paymentStatus: bill.paymentStatus
            }
        };
    }

    private static resolveDbField(item: any, dbField: string): any {
        const parts = dbField.split('.');
        let current = item;
        for (const part of parts) {
            if (current[part] === undefined) return '';
            current = current[part];
        }
        return current;
    }
}
