import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title = "Varakorn - AI Marketing Agency & Content Creator",
    description = "Award-winning content creator with 38M+ views across 261+ videos. Specializing in viral content creation, AI-powered marketing automation, and digital strategy. Transform your brand with data-driven content that converts.",
    image = "/og-image.jpg",
    url = "https://varakorn.com",
    type = "website"
}) => {
    useEffect(() => {
        // Update document title
        document.title = title;

        // Update or create meta tags
        const updateMetaTag = (property: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${property}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, property);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Standard meta tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', 'AI Marketing, Content Creator, Viral Videos, HYGR, Digital Marketing, AI Automation, Social Media Marketing, TikTok Marketing, Content Strategy');
        updateMetaTag('author', 'Varakorn');

        // Open Graph tags
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:site_name', 'Varakorn Portfolio', true);

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);
        updateMetaTag('twitter:creator', '@varakorn');

        // Additional SEO tags
        updateMetaTag('robots', 'index, follow');
        updateMetaTag('googlebot', 'index, follow');
        updateMetaTag('theme-color', '#0a0a1f');

        // Structured data (JSON-LD)
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Varakorn",
            "jobTitle": "AI Marketing Specialist & Content Creator",
            "description": description,
            "url": url,
            "image": image,
            "sameAs": [
                "https://tiktok.com/@varakorn",
                "https://github.com/KazumiGIT"
            ],
            "knowsAbout": [
                "AI Marketing",
                "Content Creation",
                "Digital Marketing",
                "Social Media Strategy",
                "Video Production"
            ],
            "alumniOf": {
                "@type": "Organization",
                "name": "HYGR"
            }
        };

        let scriptTag = document.querySelector('script[type="application/ld+json"]');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.setAttribute('type', 'application/ld+json');
            document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(structuredData);

    }, [title, description, image, url, type]);

    return null;
};
