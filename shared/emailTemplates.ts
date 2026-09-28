/**
 * Anu Atelier - Transactional Branded Email Templates
 * Mobile-friendly, rose-pink artisanal palette with plain-text fallback.
 */

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

export function renderEmail(
  templateName: string,
  data: Record<string, unknown>
): EmailRenderResult {
  const storeName = 'Anu Atelier';
  const brandColor = '#b85d43'; // Terracotta terracotta/rose-pink accent
  const supportEmail = 'support@anuatelier.com';

  switch (templateName) {
    case 'order_placed': {
      const orderNumber = data.order_number as string;
      const customerName = (data.customer_name as string) || 'Patron';
      const totalRupees = ((data.total_paise as number) / 100).toFixed(2);
      const paymentMethod = data.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment';

      return {
        subject: `Your Handcrafted Order ${orderNumber} is Placed! | ${storeName}`,
        html: `
          <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e1; border-radius: 12px; background-color: #fdfbf7;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">${storeName}</h1>
              <p style="color: #7d6b62; font-size: 14px; margin-top: 4px;">Authentic Indian Crafts & Heritage</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #eedcd5;">
              <h2 style="color: #2c2523; font-size: 18px; margin-top: 0;">Namaste ${customerName},</h2>
              <p style="color: #594d46; line-height: 1.6;">Thank you for supporting our generational artisans! Your order has been placed successfully and is being lovingly prepared at our workshops.</p>
              <div style="background-color: #faf5f2; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 4px 0; color: #594d46;"><strong>Order Number:</strong> ${orderNumber}</p>
                <p style="margin: 4px 0; color: #594d46;"><strong>Total Amount:</strong> ₹${totalRupees}</p>
                <p style="margin: 4px 0; color: #594d46;"><strong>Payment Mode:</strong> ${paymentMethod}</p>
              </div>
              <p style="color: #7d6b62; font-size: 13px; line-height: 1.5;">We will notify you the moment your package is packed and handed over to our verified courier partner.</p>
            </div>
            <p style="text-align: center; color: #a89a92; font-size: 12px; margin-top: 24px;">Have questions? Reach us at <a href="mailto:${supportEmail}" style="color: ${brandColor};">${supportEmail}</a></p>
          </div>
        `,
        text: `Namaste ${customerName},\n\nYour order ${orderNumber} for ₹${totalRupees} (${paymentMethod}) has been placed at Anu Atelier.\nOur master artisans are preparing your craft with care.\n\nSupport: ${supportEmail}`,
      };
    }

    case 'order_shipped': {
      const orderNumber = data.order_number as string;
      const courier = data.courier_name as string;
      const trackingNumber = data.tracking_number as string;
      const trackingUrl = (data.tracking_url as string) || '#';

      return {
        subject: `Your Craft Order ${orderNumber} Has Shipped! | ${storeName}`,
        html: `
          <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e1; border-radius: 12px; background-color: #fdfbf7;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">${storeName}</h1>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #eedcd5;">
              <h2 style="color: #2c2523; font-size: 18px; margin-top: 0;">Good News! Your Craft is on the Way 🚚</h2>
              <p style="color: #594d46; line-height: 1.6;">Order <strong>${orderNumber}</strong> has been carefully packed and handed to <strong>${courier}</strong>.</p>
              <div style="background-color: #faf5f2; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 4px 0; color: #594d46;"><strong>Courier:</strong> ${courier}</p>
                <p style="margin: 4px 0; color: #594d46;"><strong>Tracking AWB:</strong> ${trackingNumber}</p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${trackingUrl}" style="background-color: ${brandColor}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Track Shipment</a>
              </div>
            </div>
          </div>
        `,
        text: `Your Anu Atelier order ${orderNumber} has shipped via ${courier} (AWB: ${trackingNumber}). Track: ${trackingUrl}`,
      };
    }

    case 'abandoned_cart': {
      const customerName = (data.customer_name as string) || 'Patron';
      const recoveryUrl = (data.recovery_url as string) || 'https://anuatelier.com/cart';
      const items = (data.cart_items as Array<{ product_title: string; quantity: number; price_paise: number; image_url?: string }>) || [];

      const itemsHtml = items.map((it) => {
        const itemRupees = ((it.price_paise || 0) / 100).toFixed(2);
        return `
          <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0e6e1;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 600; color: #2c2523;">${it.product_title}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #7d6b62;">Qty: ${it.quantity} &bull; ₹${itemRupees}</p>
            </div>
          </div>
        `;
      }).join('');

      return {
        subject: `Your Handcrafted Crafts Are Waiting! ✨ | ${storeName}`,
        html: `
          <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e1; border-radius: 12px; background-color: #fdfbf7;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">${storeName}</h1>
              <p style="color: #7d6b62; font-size: 14px; margin-top: 4px;">Authentic Indian Crafts & Heritage</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #eedcd5;">
              <h2 style="color: #2c2523; font-size: 18px; margin-top: 0;">Namaste ${customerName},</h2>
              <p style="color: #594d46; line-height: 1.6;">You left some beautiful handcrafted treasures in your shopping cart. Because each piece is handmade in small batches by our generational artisans, quantities are limited.</p>
              <div style="margin: 16px 0;">
                ${itemsHtml}
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${recoveryUrl}" style="background-color: ${brandColor}; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Complete Your Order</a>
              </div>
            </div>
            <p style="text-align: center; color: #a89a92; font-size: 12px; margin-top: 24px;">You received this because you opted in to craft reminders. <a href="https://anuatelier.com/profile" style="color: ${brandColor};">Manage preferences</a></p>
          </div>
        `,
        text: `Namaste ${customerName},\n\nYou left items in your Anu Atelier cart. Complete your purchase before items sell out: ${recoveryUrl}`,
      };
    }

    case 'low_stock_alert': {
      const productTitle = data.product_title as string;
      const sku = (data.sku as string) || 'N/A';
      const currentStock = data.current_stock as number;
      const threshold = data.threshold as number;

      return {
        subject: `⚠️ Low Stock Alert: ${productTitle} (${currentStock} left) | ${storeName}`,
        html: `
          <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e1; border-radius: 12px; background-color: #fdfbf7;">
            <h2 style="color: #c92a2a; margin-top: 0;">Low Stock Notification</h2>
            <p>Product <strong>${productTitle}</strong> (SKU: ${sku}) is below the threshold.</p>
            <p>Current Stock: <strong>${currentStock}</strong> (Threshold: ${threshold})</p>
            <p>Please coordinate with the artisan for restock or adjust catalog status.</p>
          </div>
        `,
        text: `Low Stock Alert: ${productTitle} (SKU: ${sku}) has ${currentStock} left (threshold: ${threshold}).`,
      };
    }

    default:
      return {
        subject: `Update regarding your Anu Atelier Order`,
        html: `<p>Thank you for shopping at Anu Atelier.</p>`,
        text: `Thank you for shopping at Anu Atelier.`,
      };
  }
}
