// audit_assurance_flow.js - WhatsApp Chatbot Audit and Assurance Flow (Updated with API Integration)
const axios = require('axios');

class AuditAssuranceFlow {
    constructor() {
        // Audit & Assurance sub-services states
        this.AUDIT_STATES = {
            EXTERNAL_AUDITS: 'external_audits',
            INTERNAL_AUDITS: 'internal_audits',
            FORENSIC_INVESTIGATIONS: 'forensic_investigations',
            SPECIAL_PURPOSE_AUDITS: 'special_purpose_audits',
            AUDIT_APPLICATION: 'audit_application',
            COLLECT_COMPANY_NAME: 'collect_company_name',
            COLLECT_CONTACT_NAME: 'collect_contact_name',
            COLLECT_EMAIL: 'collect_email',
            COLLECT_PHONE: 'collect_phone',
            CONFIRM_APPLICATION: 'confirm_application',
            AUDIT_END: 'audit_end'
        };

        // Template IDs for Audit & Assurance sub-services
        this.AUDIT_TEMPLATES = {
            EXTERNAL_AUDITS: 'HX366b55d806bbca2974244b7628f88264',
            INTERNAL_AUDITS: 'HX855582115e3ad8f0009f7a55253bb874',
            FORENSIC_INVESTIGATIONS: 'HX5dcd9debb1f76d8827de251fd9499ea3',
            SPECIAL_PURPOSE_AUDITS: 'HX442479114fbc359916dd0573bd809a0b',
            AUDIT_APPLICATION: 'HXe12e4b9ad534c26d1a05ecace42d6b75' 
        };

        // Audit & Assurance sub-services mapping
        this.AUDIT_SUB_SERVICES = {
            'External Audits': {
                templateId: this.AUDIT_TEMPLATES.EXCEL_SERVICES,
                state: this.AUDIT_STATES.EXCEL_SERVICES
            },
            'Internal Audits  ': {
                templateId: this.AUDIT_TEMPLATES.INTERNAL_AUDITS,
                state: this.AUDIT_STATES.INTERNAL_AUDITS
            },
            'Forensic Investigations  ': {
                templateId: this.AUDIT_TEMPLATES.FORENSIC_INVESTIGATIONS,
                state: this.AUDIT_STATES.FORENSIC_INVESTIGATIONS
            },
            'Special Purpose Audits ': {
                templateId: this.AUDIT_TEMPLATES.SPECIAL_PURPOSE_AUDITS,
                state: this.AUDIT_STATES.SPECIAL_PURPOSE_AUDITS
            }
        };

        // API base URL - configure this based on your environment
        this.API_BASE_URL = 'https://echolar-admin-final.onrender.com/api/v1';

        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] AUDIT_ASSURANCE_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is an Audit & Assurance state
    isAuditState(state) {
        return Object.values(this.AUDIT_STATES).includes(state);
    }

    // Start Audit & Assurance sub-service
    startAuditSubService(session, phoneNumber, subServiceName) {
        const subService = this.AUDIT_SUB_SERVICES[subServiceName];
        
        if (subService) {
            session.state = subService.state;
            session.selectedSubService = subServiceName;
            session.applicationData = {}; // Initialize application data
            
            this.debug('Starting Audit & Assurance sub-service', {
                phoneNumber,
                subService: subServiceName,
                state: subService.state,
                templateId: subService.templateId
            });

            return {
                type: 'template',
                templateSid: subService.templateId,
                variables: {}
            };
        }

        return {
            type: 'message',
            content: `❌ Invalid Audit & Assurance service selection. Please choose from the available options.`
        };
    }

    // Process Audit & Assurance input
    async processAuditInput(message, session, phoneNumber) {
        const userInput = message.trim();
        this.debug('Processing Audit & Assurance input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            originalMessage: message
        });

        // Handle "Apply selected" button from any Audit & Assurance sub-service template
        if ((userInput.toLowerCase() === 'apply selected' || userInput.toLowerCase() === 'apply') && 
            session.state !== this.AUDIT_STATES.AUDIT_APPLICATION) {
            
            session.state = this.AUDIT_STATES.AUDIT_APPLICATION;
            session.applicationData = {}; // Reset application data
            this.debug('Audit & Assurance application started', { phoneNumber });

            return {
                type: 'message',
                content: `📋 You've selected to apply for *${session.selectedSubService}*.\n\nLet's collect some information to process your application.\n\nPlease provide your *Company Name*:`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.AUDIT_STATES.AUDIT_APPLICATION:
                session.state = this.AUDIT_STATES.COLLECT_COMPANY_NAME;
                return {
                    type: 'message',
                    content: `Please provide your *Company Name*:`
                };
                
            case this.AUDIT_STATES.COLLECT_COMPANY_NAME:
                session.applicationData.companyName = userInput;
                session.state = this.AUDIT_STATES.COLLECT_CONTACT_NAME;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your *Full Name*:`
                };
                
            case this.AUDIT_STATES.COLLECT_CONTACT_NAME:
                session.applicationData.contactName = userInput;
                session.state = this.AUDIT_STATES.COLLECT_EMAIL;
                return {
                    type: 'message',
                    content: `Great! Now please provide your *Email Address*:`
                };
                
            case this.AUDIT_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `❌ Invalid email format. Please provide a valid email address:`
                    };
                }
                session.applicationData.email = userInput.toLowerCase();
                session.state = this.AUDIT_STATES.COLLECT_PHONE;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your *Phone Number*:`
                };
                
            case this.AUDIT_STATES.COLLECT_PHONE:
                session.applicationData.phoneNumber = userInput;
                session.state = this.AUDIT_STATES.CONFIRM_APPLICATION;
                
                // Format application summary
                const summary = `
📋 *Application Summary*

*Service:* ${session.selectedSubService}
*Company Name:* ${session.applicationData.companyName}
*Contact Name:* ${session.applicationData.contactName}
*Email:* ${session.applicationData.email}
*Phone:* ${session.applicationData.phoneNumber}

Please confirm if this information is correct by typing 'confirm' to submit your application, or 'cancel' to start over.
                `;
                
                return {
                    type: 'message',
                    content: summary
                };
                
            case this.AUDIT_STATES.CONFIRM_APPLICATION:
                if (userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.AUDIT_STATES.AUDIT_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\n📋 **Application Details:**\n• Service: ${session.selectedSubService}\n• Company: ${session.applicationData.companyName}\n• Contact: ${session.applicationData.contactName}\n• Reference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our audit team will review your information and contact you shortly at ${session.applicationData.phoneNumber} or ${session.applicationData.email}.\n\nType 'menu' to return to the main menu or 'back' to return to Audit & Assurance services.`
                            };
                        } else {
                            this.debug('API call failed', applicationResult);
                            return {
                                type: 'message',
                                content: `❌ Error creating application: ${applicationResult.message}\n\n🔄 Type 'retry' to try again or 'back' to modify information.`
                            };
                        }
                    } catch (error) {
                        this.debug('Error creating application via API', error);
                        return {
                            type: 'message',
                            content: `❌ Error creating application. Please try again or contact support.\n\n🔄 Type 'retry' to try again.`
                        };
                    }
                } else if (userInput.toLowerCase() === 'cancel') {
                    session.state = this.AUDIT_STATES.AUDIT_APPLICATION;
                    session.applicationData = {};
                    return {
                        type: 'message',
                        content: `Application cancelled. Let's start over.\n\nPlease provide your *Company Name*:`
                    };
                } else if (userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);
                        
                        if (applicationResult.success) {
                            session.state = this.AUDIT_STATES.AUDIT_END;
                            session.applicationData.applicationId = applicationResult.applicationId;
                            
                            return {
                                type: 'message',
                                content: `✅ *Application Submitted Successfully!*\n\nReference: ${applicationResult.referenceNumber || 'Pending'}\n\nType 'menu' to return to the main menu.`
                            };
                        } else {
                            return {
                                type: 'message',
                                content: `❌ Error creating application: ${applicationResult.message}\n\nPlease contact support for assistance.`
                            };
                        }
                    } catch (error) {
                        this.debug('Retry failed', error);
                        return {
                            type: 'message',
                            content: `❌ Error persists. Please contact support for assistance.`
                        };
                    }
                } else {
                    return {
                        type: 'message',
                        content: `Please type 'confirm' to submit your application or 'cancel' to start over.`
                    };
                }
        }

        // Handle navigation commands
        if (userInput.toLowerCase() === 'back') {
            // Go back to Audit & Assurance main menu
            session.state = 'audit_assurance'; // Main Audit & Assurance state
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HX6ebf2d3d216ab02342453a666ee61991', // Audit & Assurance main template
                variables: {}
            };
        }

        if (userInput.toLowerCase() === 'menu') {
            // Go to main menu
            session.state = 'main_menu';
            session.selectedService = null;
            session.selectedSubService = null;
            session.applicationData = {};
            
            return {
                type: 'template',
                templateSid: 'HX1709f2dbf88a5e5cf077a618ada6a8e0', // Main menu template
                variables: {}
            };
        }

        // Default response for Audit & Assurance states
        const serviceName = session.selectedSubService || 'Audit & Assurance Service';
        return {
            type: 'message',
            content: `📋 You're in the *${serviceName}* section.\n\nPlease use the interactive buttons or:\n• Click 'Apply selected' to start application\n• Type 'back' to return to Audit & Assurance services\n• Type 'menu' for main menu\n• Type 'help' for assistance`
        };
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API - mapping to your UniversalApply model
            const applicationData = {
                companyName: session.applicationData.companyName || 'Not provided',
                email: session.applicationData.email || 'Not provided',
                contactName: session.applicationData.contactName || 'Not provided',
                phoneNumber: session.applicationData.phoneNumber || 'Not provided',
                serviceType: session.selectedSubService || 'Audit & Assurance Service',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                flowSessionData: session.applicationData // Store complete session data for reference
            };
            
            this.debug('Calling API to create audit application', {
                url: `${this.API_BASE_URL}/universal-applications`,
                data: applicationData
            });
            
            // Make API call to your universal applications endpoint
            const response = await axios.post(`${this.API_BASE_URL}/universal-applications`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data.success) {
                this.debug('Audit application created successfully via API', {
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber
                });
                
                return {
                    success: true,
                    applicationId: response.data.data._id,
                    referenceNumber: response.data.data.referenceNumber || 'N/A',
                    message: 'Application created successfully'
                };
            } else {
                this.debug('API returned error', response.data);
                return {
                    success: false,
                    message: response.data.message || 'Failed to create application'
                };
            }
            
        } catch (error) {
            this.debug('API call failed', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return {
                    success: false,
                    message: 'Cannot connect to application service'
                };
            }
            
            if (error.response) {
                return {
                    success: false,
                    message: error.response.data?.message || 'API error occurred'
                };
            }
            
            return {
                success: false,
                message: error.message || 'Unknown error occurred'
            };
        }
    }

    // Get Audit & Assurance summary for admin/debugging
    getAuditSummary(session) {
        if (!this.isAuditState(session.state)) return null;

        return {
            currentService: session.selectedSubService || 'Audit & Assurance Service',
            currentState: session.state,
            templateId: this.AUDIT_TEMPLATES[session.state] || 'N/A',
            applicationData: session.applicationData || {},
            applicationId: session.applicationData?.applicationId || 'Not created'
        };
    }

    // Calculate progress through Audit & Assurance flow
    calculateProgress(session) {
        if (!this.isAuditState(session.state)) return 0;

        const stateProgress = {
            [this.AUDIT_STATES.EXTERNAL_AUDITS]: 10,
            [this.AUDIT_STATES.INTERNAL_AUDITS]: 10,
            [this.AUDIT_STATES.FORENSIC_INVESTIGATIONS]: 10,
            [this.AUDIT_STATES.SPECIAL_PURPOSE_AUDITS]: 10,
            [this.AUDIT_STATES.AUDIT_APPLICATION]: 20,
            [this.AUDIT_STATES.COLLECT_COMPANY_NAME]: 40,
            [this.AUDIT_STATES.COLLECT_CONTACT_NAME]: 60,
            [this.AUDIT_STATES.COLLECT_EMAIL]: 80,
            [this.AUDIT_STATES.COLLECT_PHONE]: 90,
            [this.AUDIT_STATES.CONFIRM_APPLICATION]: 95,
            [this.AUDIT_STATES.AUDIT_END]: 100
        };

        return stateProgress[session.state] || 0;
    }
}

module.exports = AuditAssuranceFlow;