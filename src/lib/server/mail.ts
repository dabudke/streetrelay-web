import { Resend } from "resend";
import { RESEND_KEY } from "$env/static/private";

export const resend = new Resend(RESEND_KEY);
export default resend;
