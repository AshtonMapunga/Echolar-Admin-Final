// utils.js - Helper functions for the chatbot

/**
 * Validate Zimbabwean National ID format
 * Format: XX-XXXXXX-X-XX
 */
function validateZimbabweanID(id) {
    const idRegex = /^\d{2}-\d{6}-[A-Z]-\d{2}$/;
    return idRegex.test(id);
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Zimbabwe format)
 */
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+263|0)(7[1-9]|8[6-9])\d{7}$/;
    return phoneRegex.test(phone);
}

/**
 * Format currency amount
 */
function formatCurrency(amount) {
    // Remove any non-numeric characters except decimal point
    const numericAmount = amount.replace(/[^\d.]/g, '');
    const parsed = parseFloat(numericAmount);
    
    if (isNaN(parsed)) {
        return null;
    }
    
    return `USD ${parsed.toFixed(2)}`;
}

/**
 * Generate reference number
 */
function generateReferenceNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QPS${timestamp.slice(-6)}${random}`;
}

/**
 * Clean and format company name
 */
function formatCompanyName(name) {
    // Capitalize first letter of each word
    return name.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Validate share capital amount
 */
function validateShareCapital(amount) {
    const numericAmount = amount.replace(/[^\d.]/g, '');
    const parsed = parseFloat(numericAmount);
    
    // Minimum share capital is usually $1
    return parsed >= 1;
}

/**
 * Format address for consistency
 */
function formatAddress(address) {
    return address.trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(', ');
}

/**
 * Extract director information from formatted text
 */
function parseDirectorInfo(text) {
    const lines = text.split('\n');
    const director = {};
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('name:')) {
            director.name = trimmedLine.substring(5).trim();
        } else if (trimmedLine.toLowerCase().startsWith('id:')) {
            director.id = trimmedLine.substring(3).trim();
        } else if (trimmedLine.toLowerCase().startsWith('address:')) {
            director.address = trimmedLine.substring(8).trim();
        }
    }
    
    return director;
}

/**
 * Generate business registration summary
 */
function generateRegistrationSummary(registrationData) {
    const {
        companyName,
        businessType,
        directorName,
        directorId,
        shareCapital,
        businessAddress,
        email,
        businessDescription,
        additionalDirectors
    } = registrationData;
    
    let summary = `📋 *COMPANY REGISTRATION SUMMARY*\n\n`;
    summary += `🏢 *Company Name:* ${companyName}\n`;
    summary += `📄 *Business Type:* ${businessType}\n`;
    summary += `👤 *Main Director:* ${directorName}\n`;
    summary += `🆔 *Director ID:* ${directorId}\n`;
    summary += `💰 *Share Capital:* ${shareCapital}\n`;
    summary += `🏢 *Business Address:* ${businessAddress}\n`;
    summary += `📧 *Email:* ${email}\n`;
    
    if (additionalDirectors && additionalDirectors.length > 0) {
        summary += `👥 *Additional Directors:* ${additionalDirectors.length}\n`;
    }
    
    summary += `📝 *Business Description:* ${businessDescription}\n\n`;
    summary += `⚡ *Processing Time:* 3-5 business days\n`;
    summary += `💰 *Registration Fee:* USD 200.00\n\n`;
    summary += `Reply *CONFIRM* to submit or *EDIT* to make changes.`;
    
    return summary;
}

/**
 * Get business type requirements
 */
function getBusinessTypeRequirements(businessType) {
    const requirements = {
        'Private Limited Company (Pvt Ltd)': {
            minDirectors: 1,
            maxDirectors: 50,
            minShareCapital: 1,
            additionalDocs: ['Memorandum of Association', 'Articles of Association']
        },
        'Public Limited Company (Ltd)': {
            minDirectors: 2,
            maxDirectors: null,
            minShareCapital: 100,
            additionalDocs: ['Memorandum of Association', 'Articles of Association', 'Prospectus']
        },
        'Partnership': {
            minDirectors: 2,
            maxDirectors: 20,
            minShareCapital: null,
            additionalDocs: ['Partnership Agreement']
        },
        'Sole Proprietorship': {
            minDirectors: 1,
            maxDirectors: 1,
            minShareCapital: null,
            additionalDocs: ['Business License']
        },
        'Trust': {
            minDirectors: 3,
            maxDirectors: null,
            minShareCapital: null,
            additionalDocs: ['Trust Deed', 'Trustee Resolutions']
        },
        'Non-Profit Organization': {
            minDirectors: 3,
            maxDirectors: null,
            minShareCapital: null,
            additionalDocs: ['Constitution', 'Board Resolutions']
        }
    };
    
    return requirements[businessType] || {};
}

/**
 * Calculate estimated processing time based on business type
 */
function getProcessingTime(businessType) {
    const processingTimes = {
        'Private Limited Company (Pvt Ltd)': '3-5 business days',
        'Public Limited Company (Ltd)': '7-10 business days',
        'Partnership': '2-3 business days',
        'Sole Proprietorship': '1-2 business days',
        'Trust': '5-7 business days',
        'Non-Profit Organization': '7-14 business days'
    };
    
    return processingTimes[businessType] || '3-5 business days';
}

/**
 * Generate admin notification message
 */
function generateAdminNotification(registrationData, phoneNumber) {
    const {
        companyName,
        businessType,
        directorName,
        email
    } = registrationData;
    
    return `🚨 *NEW REGISTRATION ALERT*\n\n` +
           `📱 *Client:* ${phoneNumber}\n` +
           `🏢 *Company:* ${companyName}\n` +
           `📄 *Type:* ${businessType}\n` +
           `👤 *Director:* ${directorName}\n` +
           `📧 *Email:* ${email}\n` +
           `⏰ *Time:* ${new Date().toLocaleString()}\n\n` +
           `Please follow up within 24 hours.`;
}

module.exports = {
    validateZimbabweanID,
    validateEmail,
    validatePhoneNumber,
    formatCurrency,
    generateReferenceNumber,
    formatCompanyName,
    validateShareCapital,
    formatAddress,
    parseDirectorInfo,
    generateRegistrationSummary,
    getBusinessTypeRequirements,
    getProcessingTime,
    generateAdminNotification
};