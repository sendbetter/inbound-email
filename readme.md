# Inbound Email (SMTP) to Webhook

Author: [Martin Alexander](https://martinalexander.me/) - [LinkedIn](https://www.linkedin.com/in/martin-alexander)

A simple, efficient script that provides an SMTP server to receive emails, parse content (including headers), store attachments in Amazon S3, and forward email content to a webhook. Graceful handling of multiple concurrent SMTP sessions and webhook requests.

## Features

- SMTP server to receive emails concurrently
- Parses incoming emails using `mailparser`
- Uploads attachments to Amazon S3
- Forwards parsed email content to a specified webhook
- Configurable via environment variables
- Handles large attachments gracefully
- Robust queue system for processing multiple emails and webhook requests simultaneously

## Prerequisites

- Node.js (v18 or later recommended)
- If saving attachments, an Amazon Web Services (AWS) account with S3 access or a compatible system
- A HTTP(s) webhook endpoint to receive the processed emails

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/sendbetter/inbound-email.git
   cd inbound-email
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the `.env.example` file to `.env` and set the required configuration: (eg. `mv .env.example .env`)
   - `MAX_FILE_SIZE`: Maximum size of attachments to process, in bytes (default: 5MB)
   - `AWS_REGION`: Your AWS region
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
   - `S3_BUCKET_NAME`: The name of your S3 bucket for storing attachments
   - `PORT`: The port for the SMTP server to listen on (default: 25)
   - `WEBHOOK_URL`: The URL where parsed emails will be sent (required)
   - `SMTP_SECURE`: Set to 'true' for TLS support (default: false)
   - `WEBHOOK_CONCURRENCY`: Number of concurrent webhook requests (default: 5)

## Usage

Start the server:
```
npm start
```

The SMTP server will start and listen on the specified port (default: 25) on all network interfaces.

You can use pm2 or supervisor to keep the server running after restart. Example: `pm2 start server.js`

## Sample Use Cases

1. **Email to Ticket System**: Use this bridge to receive support emails and automatically create tickets in your helpdesk system via the webhook.

2. **Document Processing**: Receive emails with document attachments, store them in S3, and trigger a document processing pipeline through the webhook.

3. **Email Marketing Analysis**: Collect incoming emails from a campaign, store any images or attachments, and send the content to an analytics system for processing.

4. **Automated Reporting**: Set up an email address that receives automated reports, stores them in S3, and notifies your team via the webhook.

5. **DMARC Reporting**: Receive DMARC reports via email and store them in S3.

Using inbound parse for something interesting? Please let me know, I'd love to hear about it.

## Todo

- Rate limiting
- ~~Log Storage~~ (completed)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or get in touch.  

## License

This project is licensed under the MIT License. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, including for commercial purposes.

## Disclaimer

Please ensure you have the necessary permissions and security measures in place when deploying an SMTP server. Depending on your firewall configuration, you may be exposing this service to the internet.

## Security Considerations

When deploying this SMTP server, please keep the following security considerations in mind:

- Ensure that your server is properly secured and that only authorized IPs can access the SMTP port.
- Use strong, unique passwords for your AWS credentials and keep them secure.
- Regularly update the Node.js runtime and all dependencies to their latest versions.
- Consider implementing additional authentication mechanisms for the SMTP server if needed.

## Logging and Monitoring

The server logs information about received emails, webhook responses, and any errors that occur. The current logging setup includes:

- Console output for immediate visibility
- Daily rotating log files for persistent storage
- JSON formatting of log entries for easy parsing
- Timestamp inclusion for each log entry
 
Logging settings:

- Log files are stored in the `logs/` directory
- Files are named `application-YYYY-MM-DD.log`
- Log files are rotated daily and compressed
- Maximum log file size is set to 20MB
- Log files are kept for 90 days

I recommend:   

- Review log files regularly for errors or unusual patterns.
- Consider setting up log aggregation and analysis tools (e.g., ELK stack, Splunk).
- Implement alerts for critical errors or unusual activity patterns.
- Monitor system resources (CPU, memory, disk space) to ensure smooth operation.
- Set up uptime monitoring for the SMTP server and webhook endpoint.

## System Requirements

- Node.js v18 or later
- Sufficient disk space for temporary storage of attachments before S3 upload and 90 days of logging.
- Outbound internet access for S3 uploads and webhook calls
- Inbound access on the configured SMTP port. (Default: 25, or 587 if `SMTP_SECURE` is set to 'true')

## Troubleshooting

If you encounter issues:

1. Check the server logs for any error messages.
2. Ensure all environment variables are correctly set.
3. Verify that your AWS credentials have the necessary permissions for S3 operations.
4. Check that the webhook endpoint is accessible and responding correctly.
5. For attachment issues, verify that the `MAX_FILE_SIZE` setting is appropriate for your use case.

If problems persist, please open an issue on the GitHub repository with detailed information about the error and your setup.