const axios = require('axios');

class VendorNumberFlow {
    constructor() {
        this.VENDOR_STATES = {
            VENDOR_START: 'vendor_start',
            VENDOR_CONTACT_INFO: 'vendor_contact_info',
            VENDOR_DOCS_INFO: 'vendor_docs_info',
            VENDOR_CONFIRM_DOCS: 'vendor_confirm_docs',
            VENDOR_PAYMENT_INFO: 'vendor_payment_info',
            VENDOR_FINAL_CONFIRMATION: 'vendor_final_confirmation',
            VENDOR_END: 'vendor_end',
            COLLECT_COMPANY_NAME: 'collect_company_name_vendor',
            COLLECT_CONTACT_NAME: 'collect_contact_name_vendor',
            COLLECT_EMAIL: 'collect_email_vendor',
            COLLECT_PHONE: 'collect_phone_vendor',
            CONFIRM_APPLICATION: 'confirm_application_vendor'
        };

        this.REQUIRED_DOCUMENTS = [
            'Company Document (Certificate of Incorporation, CR14)',
            'Certified copies of all Directors National ID/Passport/Driver\'s License',
            'Bank Statement',
            'Proof of residence of 2 Directors'
        ];

        this.VENDOR_FEE = '$200';
        
        // API base URL
        this.API_BASE_URL = 'https://chatbotbackend-1ox6.onrender.com/api/v1';
        
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] VENDOR_FLOW: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Check if current state is a vendor registration state
    isVendorState(state) {
        return Object.values(this.VENDOR_STATES).includes(state);
    }

    // Start vendor number registration process
    async startVendorRegistration(session, phoneNumber) {
        this.debug('Starting Vendor Number registration', { phoneNumber });
        
        session.state = this.VENDOR_STATES.VENDOR_START;
        session.vendorData = {
            startTime: new Date().toISOString(),
            currentStep: 1,
            totalSteps: 6,
            applicationData: {
                phone: phoneNumber,
                fullName: '',
                email: '',
                companyName: ''
            },
            documentsAcknowledged: false,
            paymentConfirmed: false
        };

        return {
            type: 'message',
            content: `VENDOR NUMBER REGISTRATION\n\nWelcome to the Vendor Number Registration process!\n\nThis service will help you register your company to obtain a Vendor Number for government contracts and procurement opportunities.\n\nProcess Duration: 5-7 business days\nRegistration Fee: ${this.VENDOR_FEE}\n\n1. Proceed - Continue with registration\n2. Back - Return to previous menu\n\nPlease select 1 or 2:`
        };
    }

    // Process vendor registration input
    async processVendorInput(message, session, phoneNumber) {
        const userInput = message.trim();
        
        this.debug('Processing vendor input', {
            phoneNumber,
            currentState: session.state,
            userInput,
            step: session.vendorData?.currentStep
        });

        // Handle "Apply selected" or "proceed" to start application
        if ((userInput === '1' || userInput.toLowerCase() === 'proceed') &&
            session.state === this.VENDOR_STATES.VENDOR_START) {

            session.state = this.VENDOR_STATES.COLLECT_COMPANY_NAME;
            session.vendorData.currentStep = 2;
            this.debug('Vendor application started', { phoneNumber });

            return {
                type: 'message',
                content: `You've selected to apply for Vendor Number Registration.\n\nLet's collect some information to process your application.\n\nPlease provide your Company Name:`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'back') {
            session.state = 'main_menu';
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        // Handle application data collection
        switch (session.state) {
            case this.VENDOR_STATES.COLLECT_COMPANY_NAME:
                session.vendorData.applicationData.companyName = userInput;
                session.state = this.VENDOR_STATES.COLLECT_CONTACT_NAME;
                session.vendorData.currentStep = 3;
                return {
                    type: 'message',
                    content: `Thank you! Now please provide your Full Name:`
                };

            case this.VENDOR_STATES.COLLECT_CONTACT_NAME:
                session.vendorData.applicationData.fullName = userInput;
                session.state = this.VENDOR_STATES.COLLECT_EMAIL;
                session.vendorData.currentStep = 4;
                return {
                    type: 'message',
                    content: `Great! Now please provide your Email Address:`
                };

            case this.VENDOR_STATES.COLLECT_EMAIL:
                // Validate email format
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(userInput)) {
                    return {
                        type: 'message',
                        content: `Invalid email format. Please provide a valid email address:`
                    };
                }
                session.vendorData.applicationData.email = userInput.toLowerCase();
                session.state = this.VENDOR_STATES.COLLECT_PHONE;
                session.vendorData.currentStep = 5;
                return {
                    type: 'message',
                    content: `Perfect! Finally, please provide your Phone Number:`
                };

            case this.VENDOR_STATES.COLLECT_PHONE:
                session.vendorData.applicationData.phone = userInput;
                session.state = this.VENDOR_STATES.VENDOR_DOCS_INFO;
                session.vendorData.currentStep = 6;

                return {
                    type: 'message',
                    content: `REQUIRED DOCUMENTS\n\nTo complete your Vendor Number registration, you will need to provide the following documents:\n\n1. Company Document\n   • Certificate of Incorporation\n   • CR14\n\n2. Directors' Identification\n   • Certified copies of ALL Directors' National ID/Passport/Driver's License\n\n3. Financial Documentation\n   • Recent Bank Statement\n\n4. Proof of Residence\n   • Proof of residence for 2 Directors\n\n1. Understood - I have these documents ready\n2. Help - More information about documents\n3. Back - Return to previous step\n\nPlease select 1, 2, or 3:`
                };

            case this.VENDOR_STATES.VENDOR_DOCS_INFO:
                return await this.handleDocsInfo(userInput, session, phoneNumber);
            
            case this.VENDOR_STATES.VENDOR_CONFIRM_DOCS:
                return await this.handleDocsConfirmation(userInput, session, phoneNumber);
            
            case this.VENDOR_STATES.VENDOR_PAYMENT_INFO:
                return await this.handlePaymentInfo(userInput, session, phoneNumber);
            
            case this.VENDOR_STATES.VENDOR_FINAL_CONFIRMATION:
                return await this.handleFinalConfirmation(userInput, session, phoneNumber);
            
            case this.VENDOR_STATES.CONFIRM_APPLICATION:
                if (userInput === '1' || userInput.toLowerCase() === 'confirm') {
                    // Create application via API call
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);

                        if (applicationResult.success) {
                            session.state = this.VENDOR_STATES.VENDOR_END;
                            session.vendorData.applicationId = applicationResult.applicationId;

                            return {
                                type: 'message',
                                content: `Application Submitted Successfully!\n\nApplication Details:\nService: Vendor Number Registration\nCompany: ${session.vendorData.applicationData.companyName}\nContact: ${session.vendorData.applicationData.fullName}\nReference: ${applicationResult.referenceNumber || 'Pending'}\n\nThank you for your application. Our specialists will contact you within 24 hours at ${session.vendorData.applicationData.phone} or ${session.vendorData.applicationData.email} to discuss next steps.\n\n1. Menu - Return to main menu\n2. Back - Company Registration services\n\nPlease select 1 or 2:`
                            };
                        } else {
                            this.debug('API call failed', applicationResult);
                            return {
                                type: 'message',
                                content: `Error creating application: ${applicationResult.message}\n\n1. Retry - Try again\n2. Back - Modify information\n\nPlease select 1 or 2:`
                            };
                        }
                    } catch (error) {
                        this.debug('Error creating application via API', error);
                        return {
                            type: 'message',
                            content: `Error creating application. Please try again or contact support.\n\n1. Retry - Try again\n\nPlease select 1 to retry:`
                        };
                    }
                } else if (userInput === '2' || userInput.toLowerCase() === 'cancel') {
                    session.state = this.VENDOR_STATES.VENDOR_START;
                    session.vendorData = {
                        startTime: new Date().toISOString(),
                        currentStep: 1,
                        totalSteps: 6,
                        applicationData: {
                            phone: phoneNumber,
                            fullName: '',
                            email: '',
                            companyName: ''
                        },
                        documentsAcknowledged: false,
                        paymentConfirmed: false
                    };
                    return await this.startVendorRegistration(session, phoneNumber);
                } else if (userInput === '1' || userInput.toLowerCase() === 'retry') {
                    // Try to create application again
                    try {
                        const applicationResult = await this.createApplicationViaAPI(session, phoneNumber);

                        if (applicationResult.success) {
                            session.state = this.VENDOR_STATES.VENDOR_END;
                            session.vendorData.applicationId = applicationResult.applicationId;

                            return {
                                type: 'message',
                                content: `Application Submitted Successfully!\n\nReference: ${applicationResult.referenceNumber || 'Pending'}\n\n1. Menu - Return to main menu\n\nPlease select 1:`
                            };
                        } else {
                            return {
                                type: 'message',
                                content: `Error creating application: ${applicationResult.message}\n\nPlease contact support for assistance.`
                            };
                        }
                    } catch (error) {
                        this.debug('Retry failed', error);
                        return {
                            type: 'message',
                            content: `Error persists. Please contact support for assistance.`
                        };
                    }
                } else {
                    return {
                        type: 'message',
                        content: `Please select:\n1. Confirm - Submit application\n2. Cancel - Start over\n\nPlease select 1 or 2:`
                    };
                }
            
            default:
                return await this.handleVendorDefault(userInput, session, phoneNumber);
        }
    }

    // Handle document information step
    async handleDocsInfo(userInput, session, phoneNumber) {
        if (userInput === '3' || userInput.toLowerCase() === 'back') {
            session.state = this.VENDOR_STATES.COLLECT_PHONE;
            session.vendorData.currentStep = 5;
            
            return {
                type: 'message',
                content: `Perfect! Finally, please provide your Phone Number:`
            };
        }

        if (userInput === '1' || userInput.toLowerCase() === 'understood') {
            session.state = this.VENDOR_STATES.VENDOR_CONFIRM_DOCS;
            session.vendorData.currentStep = 7;
            session.vendorData.documentsAcknowledged = true;

            return {
                type: 'message',
                content: `DOCUMENT CHECKLIST CONFIRMATION\n\nPlease confirm that you have ALL the following documents ready:\n\n1. Company Document (Certificate of Incorporation, CR14)\n2. Certified copies of all Directors National ID/Passport/Driver's License\n3. Bank Statement\n4. Proof of residence of 2 Directors\n\nImportant: All documents must be certified copies where applicable.\n\n1. Confirm - I have all documents ready\n2. Missing - I need more time to gather documents\n3. Back - Previous step\n\nPlease select 1, 2, or 3:`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'help') {
            return {
                type: 'message',
                content: `DOCUMENT HELP GUIDE\n\nCertificate of Incorporation: Official company registration document from Companies Registry\n\nCR14: Company Annual Return form\n\nCertified Copies: Documents stamped and signed by a Commissioner of Oaths, Notary Public, or Legal Practitioner\n\nBank Statement: Recent statement (within 3 months) showing company account\n\nProof of Residence: Utility bill, lease agreement, or council statement for 2 directors\n\n1. Understood - Ready to continue\n\nPlease select 1:`
            };
        }

        return {
            type: 'message',
            content: `Please select:\n1. Understood - I have documents ready\n2. Help - More information\n3. Back - Previous step\n\nPlease select 1, 2, or 3:`
        };
    }

    // Handle document confirmation
    async handleDocsConfirmation(userInput, session, phoneNumber) {
        if (userInput === '3' || userInput.toLowerCase() === 'back') {
            session.state = this.VENDOR_STATES.VENDOR_DOCS_INFO;
            session.vendorData.currentStep = 6;
            session.vendorData.documentsAcknowledged = false;
            
            return {
                type: 'message',
                content: `REQUIRED DOCUMENTS\n\nTo complete your Vendor Number registration, you will need to provide the following documents:\n\n1. Company Document (Certificate of Incorporation, CR14)\n2. Certified copies of ALL Directors' National ID/Passport/Driver's License\n3. Recent Bank Statement\n4. Proof of residence for 2 Directors\n\n1. Understood - I have these documents ready\n\nPlease select 1:`
            };
        }

        if (userInput === '1' || userInput.toLowerCase() === 'confirm') {
            session.state = this.VENDOR_STATES.VENDOR_PAYMENT_INFO;
            session.vendorData.currentStep = 8;

            return {
                type: 'message',
                content: `PAYMENT INFORMATION\n\nVendor Number Registration Fee: ${this.VENDOR_FEE}\n\nWhat's Included:\n• Complete vendor number application processing\n• Document verification and submission\n• Follow-up with relevant authorities\n• Certificate delivery upon approval\n• 5-7 business days processing time\n\nPayment Methods:\n• Bank Transfer\n• Cash Payment at our offices\n• Mobile Money (EcoCash/OneMoney)\n\n1. Accept - Proceed with payment\n2. Payment - Detailed payment instructions\n3. Back - Previous step\n\nPlease select 1, 2, or 3:`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'missing') {
            return {
                type: 'message',
                content: `DOCUMENT PREPARATION TIME\n\nNo problem! Take your time to gather all required documents.\n\nNeed Help Getting Documents?\nWe can assist you with:\n• Document certification services\n• Guidance on obtaining missing documents\n• Document preparation consultation\n\nWhen you're ready with all documents, type 'start' to begin again.\nCall us for document assistance.`
            };
        }

        return {
            type: 'message',
            content: `Please select:\n1. Confirm - I have all documents ready\n2. Missing - Need more time\n3. Back - Previous step\n\nPlease select 1, 2, or 3:`
        };
    }

    // Handle payment information
    async handlePaymentInfo(userInput, session, phoneNumber) {
        if (userInput === '3' || userInput.toLowerCase() === 'back') {
            session.state = this.VENDOR_STATES.VENDOR_CONFIRM_DOCS;
            session.vendorData.currentStep = 7;
            
            return {
                type: 'message',
                content: `DOCUMENT CHECKLIST CONFIRMATION\n\nPlease confirm that you have ALL the following documents ready:\n\n1. Company Document (Certificate of Incorporation, CR14)\n2. Certified copies of all Directors National ID/Passport/Driver's License\n3. Bank Statement\n4. Proof of residence of 2 Directors\n\n1. Confirm - I have all documents ready\n\nPlease select 1:`
            };
        }

        if (userInput === '1' || userInput.toLowerCase() === 'accept') {
            session.state = this.VENDOR_STATES.CONFIRM_APPLICATION;
            session.vendorData.currentStep = 9;
            session.vendorData.paymentConfirmed = true;

            // Format application summary
            const summary = `Application Summary\n\nService: Vendor Number Registration\nCompany Name: ${session.vendorData.applicationData.companyName}\nContact Name: ${session.vendorData.applicationData.fullName}\nEmail: ${session.vendorData.applicationData.email}\nPhone: ${session.vendorData.applicationData.phone}\nFee: ${this.VENDOR_FEE}\nProcessing Time: 5-7 business days\n\n1. Confirm - Submit application\n2. Cancel - Start over\n\nPlease select 1 or 2:`;

            return {
                type: 'message',
                content: summary
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'payment') {
            return {
                type: 'message',
                content: `DETAILED PAYMENT INSTRUCTIONS\n\nBank Transfer:\nAccount Name: [Company Name]\nAccount Number: XXXXXXXXXX\nBank: [Bank Name]\nReference: VN-${phoneNumber.slice(-4)}\n\nEcoCash:\nSend ${this.VENDOR_FEE} to: XXXXXXXXX\nReference: VN-${phoneNumber.slice(-4)}\n\nOffice Payment:\nAddress: [Office Address]\nHours: Mon-Fri 8:00 AM - 5:00 PM\n\n1. Accept - Proceed with application\n\nPlease select 1:`
            };
        }

        return {
            type: 'message',
            content: `Please select:\n1. Accept - Proceed with payment\n2. Payment - Detailed instructions\n3. Back - Previous step\n\nPlease select 1, 2, or 3:`
        };
    }

    // Handle final confirmation
    async handleFinalConfirmation(userInput, session, phoneNumber) {
        if (userInput === '3' || userInput.toLowerCase() === 'back') {
            session.state = this.VENDOR_STATES.VENDOR_PAYMENT_INFO;
            session.vendorData.currentStep = 8;
            session.vendorData.paymentConfirmed = false;
            
            return {
                type: 'message',
                content: `PAYMENT INFORMATION\n\nVendor Number Registration Fee: ${this.VENDOR_FEE}\n\nPayment Methods Available\nProcessing Time: 5-7 business days\n\n1. Accept - Proceed with payment\n\nPlease select 1:`
            };
        }

        if (userInput === '1' || userInput.toLowerCase() === 'submit') {
            session.state = this.VENDOR_STATES.VENDOR_END;
            session.vendorData.completedAt = new Date().toISOString();
            session.vendorData.applicationId = `VN-${Date.now()}-${phoneNumber.slice(-4)}`;

            return {
                type: 'message',
                content: `VENDOR NUMBER APPLICATION SUBMITTED!\n\nApplication ID: ${session.vendorData.applicationId}\n\nYour Contact Information:\nName: ${session.vendorData.applicationData.fullName}\nEmail: ${session.vendorData.applicationData.email}\nPhone: ${phoneNumber}\n\nWhat Happens Next:\n• Our team will contact you within 24 hours\n• Document submission appointment will be scheduled\n• Payment arrangement will be confirmed\n• Regular updates on application progress\n• Certificate delivery upon approval (5-7 days)\n\nContact Information:\nPhone: +263 XXX XXX XXX\nEmail: vendor@company.com\n\nKeep your Application ID for reference.\n\n1. Start - New application\n2. Menu - Main services\n\nPlease select 1 or 2:`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'cancel') {
            session.vendorData = null;
            session.state = 'company_registration';
            
            return {
                type: 'message',
                content: `Vendor Number Application Cancelled\n\nYour application has been cancelled. No charges have been made.\n\n1. Start - New application\n2. Contact - Assistance\n\nPlease select 1 or 2:`
            };
        }

        return {
            type: 'message',
            content: `Please select:\n1. Submit - Submit application\n2. Back - Modify details\n3. Cancel - Cancel application\n\nPlease select 1, 2, or 3:`
        };
    }

    // Handle default/unrecognized input in vendor flow
    async handleVendorDefault(userInput, session, phoneNumber) {
        if (userInput === '1' || userInput.toLowerCase() === 'start' || userInput.toLowerCase() === 'menu') {
            session.vendorData = null;
            session.state = 'main_menu';
            return {
                type: 'message',
                content: `Returning to main menu...\n\nType 'menu' to see main services.`
            };
        }

        if (userInput === '2' || userInput.toLowerCase() === 'help') {
            const currentStep = session.vendorData?.currentStep || 1;
            return {
                type: 'message',
                content: `VENDOR NUMBER REGISTRATION HELP\n\nYou are currently on Step ${currentStep}/9\n\nAvailable Commands:\n1. Proceed - Move to next step\n2. Back - Return to previous step\n3. Help - Show this help message\n4. Start - Return to main menu\n5. Cancel - Cancel application\n\nNeed human assistance? Call for support`
            };
        }

        return {
            type: 'message',
            content: `I didn't understand that command.\n\n1. Help - Available commands\n2. Start - Return to main menu\n\nPlease select 1 or 2:`
        };
    }

    // Create application via API call
    async createApplicationViaAPI(session, phoneNumber) {
        try {
            // Prepare application data for API - mapping to your UniversalApply model
            const applicationData = {
                companyName: session.vendorData.applicationData.companyName || 'Not provided',
                email: session.vendorData.applicationData.email || 'Not provided',
                contactName: session.vendorData.applicationData.fullName || 'Not provided',
                phoneNumber: session.vendorData.applicationData.phone || 'Not provided',
                serviceType: 'Vendor Number Registration',
                status: 'Pending',
                whatsappNumber: phoneNumber,
                applicationDate: new Date().toISOString(),
                fee: this.VENDOR_FEE,
                processingTime: '5-7 business days',
                documentsRequired: this.REQUIRED_DOCUMENTS,
                flowSessionData: session.vendorData // Store complete session data for reference
            };

            this.debug('Calling API to create vendor number application', {
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
                this.debug('Vendor number application created successfully via API', {
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

    // Get vendor registration summary
    getVendorSummary(session) {
        if (!session.vendorData) return null;

        return {
            applicationId: session.vendorData.applicationId,
            applicationData: session.vendorData.applicationData,
            currentStep: session.vendorData.currentStep,
            totalSteps: session.vendorData.totalSteps,
            documentsAcknowledged: session.vendorData.documentsAcknowledged,
            paymentConfirmed: session.vendorData.paymentConfirmed,
            startTime: session.vendorData.startTime,
            completedAt: session.vendorData.completedAt,
            progress: `${session.vendorData.currentStep}/${session.vendorData.totalSteps}`,
            fee: this.VENDOR_FEE,
            status: session.state === this.VENDOR_STATES.VENDOR_END ? 'Completed' : 'In Progress'
        };
    }

    // Calculate progress percentage
    calculateProgress(session) {
        if (!session.vendorData) return 0;
        return Math.round((session.vendorData.currentStep / session.vendorData.totalSteps) * 100);
    }

    // Get all vendor states (for debugging)
    getAllStates() {
        return this.VENDOR_STATES;
    }

    // Validate vendor state transition
    isValidStateTransition(fromState, toState) {
        const stateOrder = Object.values(this.VENDOR_STATES);
        const fromIndex = stateOrder.indexOf(fromState);
        const toIndex = stateOrder.indexOf(toState);
        
        // Allow forward progression, backward navigation, or staying in same state
        return toIndex >= fromIndex - 1;
    }
}

module.exports = VendorNumberFlow;