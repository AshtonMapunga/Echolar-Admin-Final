// it_management_flow.js - WhatsApp Chatbot IT Management Flow (FIXED)

const axios = require('axios');

class ITManagementFlow {
    constructor() {

        this.IT_STATES = {
            IT_AUDIT: 'it_audit',
            SOFTWARE_INTELLIGENCE: 'software_intelligence',
            SYSTEMS_INSTALLATIONS: 'systems_installations',
            THERMAL_PRINTERS: 'thermal_printers',
            PRICING_INFO: 'pricing_info_it',
            COLLECT_COMPANY_NAME: 'collect_company_name_it',
            COLLECT_CONTACT_NAME: 'collect_contact_name_it',
            COLLECT_EMAIL: 'collect_email_it',
            COLLECT_PHONE: 'collect_phone_it',
            CONFIRM_APPLICATION: 'confirm_application_it',
            IT_END: 'it_end'
        };

        this.IT_TEMPLATES = {
            IT_AUDIT: 'HXfb0f36358bcdbca9a7742b5107e2fddf',
            SOFTWARE_INTELLIGENCE: 'HX7f301c313989a0f88d494b2e0a2e69dd',
            SYSTEMS_INSTALLATIONS: 'HX98ca59d8a7987209885d081aed32c6e9',
            THERMAL_PRINTERS: 'HXad85adb917b23f84a24a2ffdb2924957'
        };

        this.IT_SUB_SERVICES = {
            'IT Audit & Consultancy': {
                templateId: this.IT_TEMPLATES.IT_AUDIT,
                state: this.IT_STATES.IT_AUDIT
            },
            'Software Intelligence': {
                templateId: this.IT_TEMPLATES.SOFTWARE_INTELLIGENCE,
                state: this.IT_STATES.SOFTWARE_INTELLIGENCE
            },
            'Systems Installations': {
                templateId: this.IT_TEMPLATES.SYSTEMS_INSTALLATIONS,
                state: this.IT_STATES.SYSTEMS_INSTALLATIONS
            },
            'Thermal Printers': {
                templateId: this.IT_TEMPLATES.THERMAL_PRINTERS,
                state: this.IT_STATES.THERMAL_PRINTERS
            }
        };

        this.PRICING = {
            'IT Audit & Consultancy': {
                'Basic Audit': '$800',
                'Comprehensive Audit': '$2000',
                'Ongoing Consultancy': 'Custom pricing'
            },
            'Software Intelligence': {
                'Software Analysis': '$1200',
                'Optimization Plan': '$2500',
                'Implementation Support': 'Custom pricing'
            },
            'Systems Installations': {
                'Standard Installation': '$1500',
                'Enterprise Setup': '$3500',
                'Custom Configuration': 'Contact for quote'
            },
            'Thermal Printers': {
                'Basic Setup': '$300',
                'Advanced Configuration': '$800',
                'Bulk Deployment': 'Custom pricing'
            }
        };

        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';
    }

    debug(message, data = null) {
        console.log(`[IT_FLOW] ${message}`);
        if (data) console.log(data);
    }

    isITState(state) {
        return Object.values(this.IT_STATES).includes(state);
    }

    // ✅ FIX 1: Always move to PRICING_INFO after service selection
    startITSubService(session, phoneNumber, subServiceName) {
        const subService = this.IT_SUB_SERVICES[subServiceName];

        if (!subService) {
            return {
                type: 'message',
                content: `❌ Invalid IT service selection.`
            };
        }

        session.selectedSubService = subServiceName;
        session.applicationData = {};
        session.state = this.IT_STATES.PRICING_INFO;

        this.debug('IT service selected', { phoneNumber, subServiceName });

        return {
            type: 'template',
            templateSid: subService.templateId,
            variables: {}
        };
    }

    showPricingInformation(session) {
        const pricing = this.PRICING[session.selectedSubService];
        let message = `💰 *Pricing for ${session.selectedSubService}*\n\n`;

        for (const [plan, price] of Object.entries(pricing)) {
            message += `• ${plan}: ${price}\n`;
        }

        message += `\nType *proceed* to continue or *back* to change service.`;

        return { type: 'message', content: message };
    }

    async processITInput(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        // ✅ FIX 2: Allow proceed from ANY IT service state
        if (userInput === 'proceed' && this.isITState(session.state)) {
            session.state = this.IT_STATES.COLLECT_COMPANY_NAME;
            return {
                type: 'message',
                content: `📋 Applying for *${session.selectedSubService}*\n\nPlease enter your *Company Name*:`
            };
        }

        switch (session.state) {

            case this.IT_STATES.COLLECT_COMPANY_NAME:
                session.applicationData.companyName = message;
                session.state = this.IT_STATES.COLLECT_CONTACT_NAME;
                return { type: 'message', content: `Please provide your *Full Name*:` };

            case this.IT_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = message;
                session.state = this.IT_STATES.COLLECT_EMAIL;
                return { type: 'message', content: `Please provide your *Email Address*:` };

            case this.IT_STATES.COLLECT_EMAIL:
                if (!/\S+@\S+\.\S+/.test(message)) {
                    return { type: 'message', content: `❌ Invalid email. Try again:` };
                }
                session.applicationData.email = message;
                session.state = this.IT_STATES.COLLECT_PHONE;
                return { type: 'message', content: `Please provide your *Phone Number*:` };

            case this.IT_STATES.COLLECT_PHONE:
                session.applicationData.phoneNumber = message;
                session.state = this.IT_STATES.CONFIRM_APPLICATION;
                return {
                    type: 'message',
                    content:
`📋 *Confirm Application*
Service: ${session.selectedSubService}
Company: ${session.applicationData.companyName}
Name: ${session.applicationData.contactName}
Email: ${session.applicationData.email}
Phone: ${session.applicationData.phoneNumber}

Type *confirm* to submit or *cancel* to stop.`
                };

            case this.IT_STATES.CONFIRM_APPLICATION:
                if (userInput === 'confirm') {
                    const result = await this.createApplicationViaAPI(session, phoneNumber);
                    if (result.success) {
                        session.state = this.IT_STATES.IT_END;
                        return {
                            type: 'message',
                            content: `✅ Application submitted successfully!\nReference: ${result.referenceNumber}`
                        };
                    }
                    return { type: 'message', content: `❌ Submission failed.` };
                }
                return { type: 'message', content: `Type *confirm* or *cancel*.` };
        }

        return {
            type: 'message',
            content: `Type *proceed* to apply, *back* to go back, or *menu* for main menu.`
        };
    }

    async createApplicationViaAPI(session, phoneNumber) {
        try {
            const response = await axios.post(
                `${this.API_BASE_URL}/universal-applications`,
                {
                    ...session.applicationData,
                    serviceType: session.selectedSubService,
                    whatsappNumber: phoneNumber
                }
            );

            return {
                success: true,
                referenceNumber: response.data?.data?.referenceNumber || 'Pending'
            };

        } catch (error) {
            return { success: false };
        }
    }
}

module.exports = ITManagementFlow;
