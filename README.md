# Feedback Mail Server

This project provides a publicly available mail server for user feedback handling. It uses Node.js and integrates with Google AI to check the relevancy of feedback messages before sending them to specified email addresses.

## Part 1: Using the Service

### Base URL
The service is hosted on Render. Use the following base URL to access the service:
### https://feedback-mail-server.onrender.com


### Endpoints

#### POST `/contact`

**Description**: Sends feedback to specified receiver email addresses after checking the relevancy of the message.

**Request Body**:
```json
{   
    "name":"testuser",
    "email": "user@example.com",
    "feedback": "This is a feedback message.",
    "context": "product feedback",
    "receiverEmail": "receiver@gmail.com"
}
```
**Response**:

- Success (200): Message sent
- Failure (400): Message is not relevant or Missing required fields: name, email, feedback, context, receiverEmail
- Error (500): Error message

## Part 2: Setting Up a Customized Server

### Prerequisites
- Obtaining Google AI API key.
- Setting up a receiver Gmail account.
- Getting app password for your Gmail account after 2FA.


### Clone the repository 
```terminal
git clone https://github.com/yuvrajzanwar/feedback-mail-server.git
cd feedback-mail-server
npm install
```
### Create a env file
```.env
EMAIL_USER=your-email@gmail.com
APP_PASS=your-app-password
GOOGLEAI_API_KEY=your-google-ai-api-key
```
### Run the server
```terminal
node server.js
```
## Updates coming soon

## Contributing
### Feel free to submit issues or pull requests to improve the project.

## License
### This project is licensed under the MIT License.

