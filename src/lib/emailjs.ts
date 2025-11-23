import emailjs from '@emailjs/browser';

export const sendEmail = async (templateParams: Record<string, unknown>) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        console.error('EmailJS environment variables are missing');
        return;
    }

    try {
        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log('Email sent successfully!', response.status, response.text);
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};
