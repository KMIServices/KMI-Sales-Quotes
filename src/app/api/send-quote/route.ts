import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { formData, quoteDetails } = await request.json();

    // Generate a unique ID for the quote
    const quoteId = `KMI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Store the quote first
    try {
      await fetch('/api/store-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData, quoteDetails, quoteId }),
      });
    } catch (error) {
      console.error('Error storing quote:', error);
      // Continue with email even if storage fails
    }

    // Create a transporter
    // Note: In production, use environment variables for these credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'username',
        pass: process.env.SMTP_PASS || 'password',
      },
    });

    // Format date and time
    const formattedDate = new Date(formData.preferredDate).toLocaleDateString('en-GB');
    const formattedTime = formData.preferredTime;

    // Format extras for email
    const extrasHtml = quoteDetails.extrasBreakdown.length > 0
      ? `<h3>Selected Extras:</h3>
         <ul>
           ${quoteDetails.extrasBreakdown.map((extra: any) => 
             `<li>${extra.name}: £${extra.cost.toFixed(2)}</li>`).join('')}
         </ul>`
      : '<p>No extras selected</p>';

    // Create HTML email content
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #1e40af; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f1f5f9; }
            .total { font-weight: bold; font-size: 1.2em; }
            .quote-id { background-color: #f1f5f9; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>KMI Services Cleaning Quote</h1>
            
            <div class="quote-id">
              <strong>Quote ID:</strong> ${quoteId}
            </div>
            
            <h2>Customer Details</h2>
            <table>
              <tr>
                <th>Name:</th>
                <td>${formData.customerName}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>${formData.address}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>${formData.email}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>${formData.phone}</td>
              </tr>
              <tr>
                <th>Preferred Date:</th>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <th>Preferred Time:</th>
                <td>${formattedTime}</td>
              </tr>
              <tr>
                <th>Referral Source:</th>
                <td>${formData.referralSource}${formData.otherReferral ? ` - ${formData.otherReferral}` : ''}</td>
              </tr>
            </table>
            
            <h2>Service Details</h2>
            <table>
              <tr>
                <th>Service Type:</th>
                <td>${quoteDetails.serviceType}</td>
              </tr>
              <tr>
                <th>Property Size:</th>
                <td>${quoteDetails.propertySize}</td>
              </tr>
              <tr>
                <th>Soiling Level:</th>
                <td>${quoteDetails.soilingLevel}</td>
              </tr>
              <tr>
                <th>Estimated Time:</th>
                <td>${quoteDetails.estimatedTime} hours</td>
              </tr>
              <tr>
                <th>Cleaners Required:</th>
                <td>${quoteDetails.cleanersRequired}</td>
              </tr>
            </table>
            
            <h2>Cost Breakdown</h2>
            <table>
              <tr>
                <th>Labour Cost:</th>
                <td>£${quoteDetails.labourCost}</td>
              </tr>
              <tr>
                <th>Material Cost:</th>
                <td>£${quoteDetails.materialCost}</td>
              </tr>
              <tr>
                <th>Base Cost:</th>
                <td>£${quoteDetails.baseCost}</td>
              </tr>
            </table>
            
            ${extrasHtml}
            
            <table>
              <tr>
                <th>Contractor Price:</th>
                <td>£${quoteDetails.contractorPrice}</td>
              </tr>
              <tr>
                <th>30% Markup:</th>
                <td>£${quoteDetails.markup}</td>
              </tr>
              <tr class="total">
                <th>Final Price:</th>
                <td>£${quoteDetails.finalPrice}</td>
              </tr>
            </table>
            
            <h2>Additional Information</h2>
            <p><strong>Notes:</strong> ${formData.additionalNotes || 'None provided'}</p>
            <p><strong>Site Visit Required:</strong> ${formData.siteVisitRequired ? 'Yes' : 'No'}</p>
            
            <h2>Next Steps</h2>
            <p>${formData.siteVisitRequired 
              ? 'A site visit needs to be arranged to finalize the quote.' 
              : 'Please request the customer to send photos to help finalize the quote.'}</p>
            
            <p>This quote can be viewed and managed in the KMI Services Quote Tracker system.</p>
          </div>
        </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'quotes@kmiservices.co.uk',
      to: process.env.EMAIL_TO || 'info@kmiservices.co.uk',
      subject: `New Cleaning Quote ${quoteId} - ${formData.customerName}`,
      html: htmlContent,
    };

    // In development, we'll just log the email content instead of sending
    console.log('Email would be sent with the following content:');
    console.log(mailOptions);

    // In production, this would send the email
    // Uncomment the following line in production
    // await transporter.sendMail(mailOptions);

    // Also send a confirmation email to the customer if they provided an email
    if (formData.email) {
      const customerMailOptions = {
        from: process.env.EMAIL_FROM || 'quotes@kmiservices.co.uk',
        to: formData.email,
        subject: `Your KMI Services Cleaning Quote ${quoteId}`,
        html: htmlContent.replace(
          '<p>This quote can be viewed and managed in the KMI Services Quote Tracker system.</p>',
          '<p>Thank you for your interest in KMI Services. We will be in touch shortly to discuss your quote.</p>'
        ),
      };
      
      console.log('Customer confirmation email would be sent:');
      console.log(customerMailOptions);
      
      // Uncomment the following line in production
      // await transporter.sendMail(customerMailOptions);
    }

    return NextResponse.json({ 
      success: true,
      quoteId: quoteId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
