import Environment from "../environments/environment";
import Mailjet from "node-mailjet";

const env: Environment = new Environment()

const mailjet = new Mailjet({
    apiSecret: env.mj_secret,
    apiKey: env.mj_private
})
// .connect(env.mj_private, env.mj_secret);

const sender = "emmanuel.olusola@pmt.ng";
const name = "Emmanuel Olusola";

export default async function mailerService(data: {
    email?: string;
    name?: string;
    template?: number;
    subject?: string;
    variables?: any;
}) {
    const request = mailjet
        .post("send", { version: "v3.1" })
        .request({
            Messages: [{
                From: {
                    Email: sender,
                    Name: name,
                },
                To: [{
                    Email: data.email,
                    Name: data.name,
                }],
                TemplateID: data.template,
                TemplateLanguage: true,
                Subject: data.subject,
                Variables: data.variables,
                // Variables: {
                //     client_name: "client",
                //     confirmation_link: "",
                //   },
            }],
        });
    return new Promise((resolve, reject) => {
        try {
            request
                .then((result) => {
                    console.log(result.body);
                    resolve(result.body);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        } catch (error) {
            reject(error);
        }
    });
}
