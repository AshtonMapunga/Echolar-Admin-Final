// it_management_flow.js - FIXED TO MATCH BUSINESS SOFTWARE FLOW
const axios = require('axios');

class ITManagementFlow {
    constructor() {
        this.IT_STATES = {
            PRICING_INFO: 'pricing_info_it',
            COLLECT_COMPANY_NAME: 'collect_company_name_it',
            COLLECT_CONTACT_NAME: 'collect_contact_name_it',
            COLLECT_EMAIL: 'collect_email_it',
            COLLECT_PHONE: 'collect_phone_it',
            CONFIRM_APPLICATION: 'confirm_application_it',
            IT_END: 'it_end'
        };

        this.IT_TEMPLATES = {
            'IT Audit & Consultancy': 'HXfb0f36358bcdbca9a7742b5107e2fddf',
            'Software Intelligence': 'HX7f301c313989a0f88d494b2e0a2e69dd',
            'Systems Installations': 'HX98ca59d8a7987209885d081aed32c6e9',
            'Thermal Printers': 'HXad85adb917b23f84a24a2ffdb2924957'
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

    /* ================= START SUB SERVICE ================= */

    startITSubService(session, phoneNumber, subServiceName) {
        session.selectedSubService = subServiceName;
        session.state = this.IT_STATES.PRICING_INFO;
        session.applicationData = {};

        return {
            type: 'template',
            templateSid: this.IT_TEMPLATES[subServiceName],
            variables: {}
        };
    }

    /* ================= PRICING ================= */

    showPricingInformation(session) {
        const pricing = this.PRICING[session.selectedSubService];
        let msg = `💰 *Pricing for ${session.selectedSubService}*\n\n`;

        for (const [plan, price] of Object.entries(pricing)) {
            msg += `• ${plan}: ${price}\n`;
        }

        msg += `\n✅ Type *proceed* to continue\n↩️ Type *back* to return`;

        return { type: 'message', content: msg };
    }

    /* ================= INPUT HANDLER ================= */

    async processITInput(message, session, phoneNumber) {
        const userInput = message.trim().toLowerCase();

        /** PROCEED FROM PRICING → FORM */
        if (
            (userInput === 'proceed' || userInput === 'apply') &&
            session.state === this.IT_STATES.PRICING_INFO
        ) {
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
                return { type: 'message', content: 'Enter *Full Name*:' };

            case this.IT_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = message;
                session.state = this.IT_STATES.COLLECT_EMAIL;
                return { type: 'message', content: 'Enter *Email Address*:' };

            case this.IT_STATES.COLLECT_EMAIL:
                if (!/\S+@\S+\.\S+/.test(message)) {
                    return { type: 'message', content: '❌ Invalid email. Try again:' };
                }
                session.applicationData.email = message;
                session.state = this.IT_STATES.COLLECT_PHONE;
                return { type: 'message', content: 'Enter *Phone Number*:' };

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

Type *confirm* to submit or *cancel* to restart`
                };

            case this.IT_STATES.CONFIRM_APPLICATION:
                if (userInput === 'confirm') {
                    await this.createApplicationViaAPI(session, phoneNumber);
                    session.state = this.IT_STATES.IT_END;
                    return { type: 'message', content: '✅ Application submitted successfully!' };
                }

                if (userInput === 'cancel') {
                    session.state = this.IT_STATES.PRICING_INFO;
                    session.applicationData = {};
                    return this.showPricingInformation(session);
                }
                break;
        }

        /* NAVIGATION */
        if (userInput === 'back') {
            session.state = 'it_is_management';
            session.selectedSubService = null;
            session.applicationData = {};
            return {
                type: 'template',
                templateSid: 'HXc7b4fbad99fe9dc75f48a96a422bfeb2',
                variables: {}
            };
        }

        if (userInput === 'menu') {
            session.state = 'main_menu';
            session.selectedSubService = null;
            session.applicationData = {};
            return {
                type: 'template',
                templateSid: 'HX1709f2dbf88a5e5cf077a618ada6a8e0',
                variables: {}
            };
        }

        return {
            type: 'message',
            content: `Type *proceed* to continue or *back* to return`
        };
    }

    /* ================= API ================= */

    async createApplicationViaAPI(session, phoneNumber) {
        await axios.post(`${this.API_BASE_URL}/universal-applications`, {
            ...session.applicationData,
            serviceType: session.selectedSubService,
            whatsappNumber: phoneNumber,
            status: 'Pending'
        });
    }
}

module.exports = ITManagementFlow;
