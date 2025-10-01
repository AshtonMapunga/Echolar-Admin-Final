const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ngrok = require('@ngrok/ngrok');
const cors = require('cors');

require('dotenv').config();
const FlowTree = require('./flowtree');
const flowTree = new FlowTree();



const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';


const applicationRoutes = require('./routes/apply_service_route');
const applicationCompDeregistrationRoutes = require('./routes/company_de_registration_route');
const vendorNumberRoutes = require('./routes/vendor_number_route');
const universalApplyRoutes = require('./routes/universal_apply_route');
const licenceApplyRoutes = require('./routes/licence_service_route');
const churchRegApplyRoutes = require('./routes/church_reg_route');
const PrazRegApplyRoutes = require('./routes/praz_reg_route');
const CollegelyRoutes = require('./routes/college_reg_route');




async function connectToDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sebatech2024:xcGRZSYqgiLbwbO0@escholar.f51th.mongodb.net/reg';
        
        debug('Connecting to MongoDB', {
            uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Hide credentials in logs
        });
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        //change
        console.log('✅ Connected to MongoDB successfully');
        debug('MongoDB connection established');
        
    } catch (error) {
        debug('MongoDB connection error', {
            error: error.message,
            name: error.name
        });
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// ADD MONGODB EVENT HANDLERS
mongoose.connection.on('error', (err) => {
    debug('MongoDB connection error', { error: err.message });
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    debug('MongoDB disconnected');
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    debug('MongoDB reconnected');
    console.log('✅ MongoDB reconnected');
});



// Debug function
function debug(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
        console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
    }
}

// Environment debug
debug('Starting WhatsApp Chatbot');
debug('Environment', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: PORT,
    IS_PRODUCTION: IS_PRODUCTION,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET',
    MESSAGING_SERVICE_SID: process.env.MESSAGING_SERVICE_SID ? 'SET' : 'NOT SET'
});

// Twilio credentials - update these with your actual credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';

debug('Twilio Configuration', {
    accountSid: accountSid.substring(0, 10) + '...',
    authTokenLength: authToken.length
});

const client = twilio(accountSid, authToken);

// Twilio Messaging Service SID (for WhatsApp Business API)
const MESSAGING_SERVICE_SID = process.env.MESSAGING_SERVICE_SID || 'MG07d4f69273881dca15456fe895a49eec';

// Template configuration
const WELCOME_TEMPLATE_SID = 'HX9d97210101cad9ddb8ea5b1db8f7a6a9';

debug('WhatsApp Configuration', {
    messagingServiceSid: MESSAGING_SERVICE_SID,
    welcomeTemplateSid: WELCOME_TEMPLATE_SID
});

// Middleware
app.use(cors(
    {
           origin: [
   
    "https://company-reg-admin.vercel.app",
     "http://localhost:5173"
   
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "application/json"],
    }
));
//try
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/comp_de_reg_applications', applicationCompDeregistrationRoutes);
app.use('/api/v1/vendor_number', vendorNumberRoutes);
app.use('/api/v1/universal-applications', universalApplyRoutes);
app.use('/api/v1/licence-applications', licenceApplyRoutes);
app.use('/api/v1/church_reg_apply', churchRegApplyRoutes);
app.use('/api/v1/praz_reg_apply', PrazRegApplyRoutes);
app.use('/api/v1/college_applications', CollegelyRoutes);




// Request logging middleware
app.use((req, res, next) => {
    debug(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        query: req.query,
        ip: req.ip
    });
    next();
});

// Helper function to send WhatsApp template message
async function sendWhatsAppTemplate(to, templateSid, templateVariables = {}) {
    debug('Attempting to send WhatsApp template message', {
        to: to,
        templateSid: templateSid,
        templateVariables: templateVariables,
        messagingServiceSid: MESSAGING_SERVICE_SID
    });
    
    try {
        // Validate inputs
        if (!to || !templateSid) {
            throw new Error('Missing required parameters: to or templateSid');
        }
        
        if (!MESSAGING_SERVICE_SID || MESSAGING_SERVICE_SID === 'MG07d4f69273881dca15456fe895a49eec') {
            debug('Warning: Using default Messaging Service SID - make sure this is correct');
        }
        
        const messageConfig = {
            messagingServiceSid: MESSAGING_SERVICE_SID,
            to: to,
            contentSid: templateSid,
            statusCallback: `https://your-render-app.onrender.com/status` // Add your actual render URL here
        };

        // Add content variables if provided
        if (Object.keys(templateVariables).length > 0) {
            messageConfig.contentVariables = JSON.stringify(templateVariables);
        }
        
        const response = await client.messages.create(messageConfig);
        
        debug('Template message sent successfully', {
            sid: response.sid,
            status: response.status,
            to: response.to,
            contentSid: templateSid,
            messagingServiceSid: response.messagingServiceSid,
            dateCreated: response.dateCreated,
            direction: response.direction
        });
        
        console.log('✅ Template message sent:', response.sid);
        return response;
    } catch (error) {
        debug('Error sending WhatsApp template message', {
            error: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
            status: error.status,
            details: error.details,
            to: to,
            templateSid: templateSid,
            messagingServiceSid: MESSAGING_SERVICE_SID
        });
        
        console.error('❌ Error sending template message:', error);
        throw error;
    }
}

// Helper function to send regular WhatsApp message
async function sendWhatsAppMessage(to, message) {
    debug('Attempting to send WhatsApp message', {
        to: to,
        message: message,
        messagingServiceSid: MESSAGING_SERVICE_SID
    });
    
    try {
        if (!to || !message) {
            throw new Error('Missing required parameters: to or message');
        }
        
        if (!MESSAGING_SERVICE_SID || MESSAGING_SERVICE_SID === 'MG07d4f69273881dca15456fe895a49eec') {
            debug('Warning: Using default Messaging Service SID - make sure this is correct');
        }
        
        const response = await client.messages.create({
            messagingServiceSid: MESSAGING_SERVICE_SID,
            body: message,
            to: to,
            statusCallback: `https://your-render-app.onrender.com/status` // Add your actual render URL here
        });
        
        debug('Message sent successfully', {
            sid: response.sid,
            status: response.status,
            to: response.to,
            messagingServiceSid: response.messagingServiceSid,
            dateCreated: response.dateCreated,
            direction: response.direction
        });
        
        console.log('✅ Message sent:', response.sid);
        return response;
    } catch (error) {
        debug('Error sending WhatsApp message', {
            error: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
            status: error.status,
            details: error.details,
            to: to,
            messagingServiceSid: MESSAGING_SERVICE_SID
        });
        
        console.error('❌ Error sending message:', error);
        throw error;
    }
}

// // Updated message processing function
// async function processUserInput(message, userPhoneNumber) {
//     debug('Processing user input', {
//         originalMessage: message,
//         messageType: typeof message,
//         userPhoneNumber: userPhoneNumber
//     });
    
//     const userInput = (typeof message === 'string' ? message.trim().toLowerCase() : '');
    
//     debug('Processed input', {
//         userInput: userInput,
//         length: userInput.length
//     });

//     if (userInput === 'hi' || userInput === 'hello') {
//         debug('Matched greeting - sending hello response');
//         return { type: 'message', content: 'Hello! How are you?' };
//     }

//     debug('No match found - sending default response');
//     return { type: 'message', content: "Sorry, I don't understand. Please say 'hi' or 'hello'." };
// }



async function processUserInput(message, userPhoneNumber) {
    debug('Processing user input', {
        originalMessage: message,
        messageType: typeof message,
        userPhoneNumber: userPhoneNumber
    });
    
    try {
        // Use the FlowTree to process the input
        const response = await flowTree.processInput(message, userPhoneNumber);
        
        debug('FlowTree response', {
            response: response,
            userPhone: userPhoneNumber
        });
        
        // If response is a template, send it
        if (response.type === 'template') {
            try {
                await sendWhatsAppTemplate(userPhoneNumber, response.templateSid, response.variables || {});
                return { type: 'template', sent: true };
            } catch (error) {
                debug('Template sending failed, falling back to regular message', {
                    error: error.message,
                    templateSid: response.templateSid
                });
                
                // Fallback to regular message if template fails
                const fallbackMessage = getFallbackMessage(response);
                return { type: 'message', content: fallbackMessage };
            }
        }
        
        // Return regular message response
        return response;
        
    } catch (error) {
        debug('Error in processUserInput', {
            error: error.message,
            stack: error.stack,
            userPhone: userPhoneNumber,
            message: message
        });
        
        // Fallback response for errors
        return {
            type: 'message',
            content: "❌ Sorry, I encountered an error. Please try again or type 'help' for assistance."
        };
    }
}

// Helper function to generate fallback messages when templates fail
function getFallbackMessage(templateResponse) {
    // Map template SIDs to fallback messages
    const fallbacks = {
        'HX9d97210101cad9ddb8ea5b1db8f7a6a9': flowTree.getMainServicesMenu(), // Welcome template fallback
        'HX_main_menu_template_id': flowTree.getMainServicesMenu(),
        'HX_sub_menu_template_id': "📋 Please select from the available sub-services by typing the number.",
        'HX_info_collection_template_id': "📝 Please provide the requested information.",
        'HX_confirmation_template_id': "📋 Please review and confirm your information."
    };
    
    return fallbacks[templateResponse.templateSid] || "📋 Please choose from the available options.";
}

// Add these helper endpoints for debugging and management

// Debug endpoint to view user sessions
app.get('/debug/sessions', (req, res) => {
    const sessions = flowTree.getAllSessions();
    res.json({
        totalSessions: sessions.length,
        sessions: sessions
    });
});

// Debug endpoint to view specific user session
app.get('/debug/session/:phone', (req, res) => {
    const phone = req.params.phone;
    const session = flowTree.getSessionInfo(phone);
    
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            phone: phone
        });
    }
    
    res.json({
        phone: phone,
        session: session
    });
});

// Debug endpoint to reset user session
app.post('/debug/reset/:phone', (req, res) => {
    const phone = req.params.phone;
    flowTree.resetUserSession(phone);
    res.json({
        message: 'Session reset successfully',
        phone: phone
    });
});

// Test endpoint to simulate user input
app.post('/test/input', async (req, res) => {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({
            error: 'Missing phone or message in request body'
        });
    }
    
    try {
        const response = await processUserInput(message, phone);
        res.json({
            input: message,
            phone: phone,
            response: response,
            sessionInfo: flowTree.getSessionInfo(phone)
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error processing input',
            message: error.message
        });
    }
});
// Status callback endpoint to track message delivery
app.post('/status', (req, res) => {
    debug('Status callback received', {
        headers: req.headers,
        body: req.body,
        contentType: req.headers['content-type']
    });
    
    const { 
        MessageSid, 
        MessageStatus, 
        ErrorCode, 
        ErrorMessage,
        From,
        To,
        Body
    } = req.body;
    
    debug('Message status update', {
        MessageSid: MessageSid,
        MessageStatus: MessageStatus,
        ErrorCode: ErrorCode,
        ErrorMessage: ErrorMessage,
        From: From,
        To: To,
        Body: Body
    });
    
    // Log the status for debugging
    console.log(`📊 Message Status Update: ${MessageSid} - ${MessageStatus}`);
    
    if (ErrorCode) {
        console.error(`❌ Message Error ${ErrorCode}: ${ErrorMessage}`);
    }
    
    res.status(200).send('OK');
});

app.post('/webhook', async (req, res) => {
    debug('Webhook received', {
        headers: req.headers,
        body: req.body,
        contentType: req.headers['content-type']
    });
    
    try {
        const { From, Body, MessageSid, AccountSid, To } = req.body;
        
        debug('Parsed webhook data', {
            From: From,
            Body: Body,
            MessageSid: MessageSid,
            AccountSid: AccountSid,
            To: To
        });
        
        if (!From || !Body) {
            debug('Missing required fields', {
                hasFrom: !!From,
                hasBody: !!Body
            });
            return res.status(400).send('Missing required fields');
        }
        
        console.log(`📨 Received message from ${From}: ${Body}`);
        
        // Process the user input
        const response = await processUserInput(Body, From);
        
        debug('Generated response', {
            response: response
        });
        
        // Send appropriate response based on type
        if (response.type === 'template' && response.sent) {
            console.log('✅ Template message already sent');
        } else if (response.type === 'message') {
            await sendWhatsAppMessage(From, response.content);
        }
        
        debug('Webhook processed successfully');
        res.status(200).send('OK');
    } catch (error) {
        debug('Webhook error', {
            error: error.message,
            stack: error.stack,
            name: error.name
        });
        
        console.error('❌ Webhook error:', error);
        res.status(500).send('Error processing message');
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    debug('Health check requested');
    const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        welcomeTemplateSid: WELCOME_TEMPLATE_SID
    };
    
    debug('Health check response', healthData);
    res.json(healthData);
});

app.get('/', (req, res) => {
    debug('Root endpoint accessed');
    res.send('WhatsApp Chatbot with Template Support is running! 🚀');
});

// Error handling middleware
app.use((error, req, res, next) => {
    debug('Express error handler', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
    });
    
    console.error('❌ Express Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    debug('404 Not Found', {
        url: req.url,
        method: req.method
    });
    
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Start server
app.listen(PORT, async() => {
    console.log(`🚀 WhatsApp Chatbot Server running on port ${PORT}`);

        await connectToDatabase();
    console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`📋 Welcome Template SID: ${WELCOME_TEMPLATE_SID}`);
    
    debug('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        isProduction: IS_PRODUCTION,
        welcomeTemplateSid: WELCOME_TEMPLATE_SID
    });

    // Only start ngrok in development
    if (!IS_PRODUCTION) {
        try {
            // Start ngrok tunnel
            const listener = await ngrok.connect({ 
                addr: PORT, 
                authtoken_from_env: true
            });
            console.log(`🚀 Ngrok tunnel established at: ${listener.url()}`);
            console.log(`📱 Set this as your webhook URL in Twilio: ${listener.url()}/webhook`);
            
            debug('Ngrok tunnel started', {
                url: listener.url()
            });
        } catch (error) {
            debug('Failed to start ngrok tunnel', {
                error: error.message,
                stack: error.stack
            });
            console.error('❌ Failed to start ngrok tunnel:', error);
        }
    } else {
        console.log('🌐 Running in production mode - ngrok disabled');
        debug('Production mode - ngrok disabled');
    }
});

// Process error handlers
process.on('uncaughtException', (error) => {
    debug('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    debug('Unhandled Rejection', {
        reason: reason,
        promise: promise
    });
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    debug('SIGTERM received');
    console.log('👋 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    debug('SIGINT received');
    console.log('👋 SIGINT received, shutting down gracefully');
    process.exit(0);
});