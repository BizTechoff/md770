import jwt from 'jsonwebtoken';
import { BackendMethod, Controller, ControllerBase, Fields, UserInfo, Validators } from "remult";
import { terms } from "../terms";
import { Roles } from "./roles";
import { User } from "./user";

@Controller('signIn')
export class SignInController extends ControllerBase {
    @Fields.string({
        caption: terms.username,
        validate: Validators.required
    })
    user = '';
    @Fields.string({
        caption: terms.password,
        validate: Validators.required,
        inputType: 'password'
    })
    password = '';

    @Fields.boolean({
        caption: terms.rememberOnThisDevice,
    })
    rememberOnThisDevice = true;

    @BackendMethod({ allowed: true })
    async signIn() {
        let result: UserInfo;
        const userRepo = this.remult.repo(User);
        let u = await userRepo.findFirst({ name: this.user });
        if (!u) {
            if (await userRepo.count() === 0) { //first ever user is the admin
                u = await userRepo.insert({
                    name: this.user,
                    admin: true
                })
            }
        }
        if (u) {
            if (!u.password) { // if the user has no password defined, the first password they use is their password
                u.hashAndSetPassword(this.password);
                await u.save();
            }

            if (await u.passwordMatches(this.password)) {
                result = {
                    id: u.id,
                    roles: [],
                    name: u.name,
                    isAdmin: false,
                    isManager: false,
                    isSocial: false,
                    isSite: false
                };
                if (u.admin) {
                    result.roles.push(Roles.admin);
                    result.isAdmin = true
                }
                else if (u.manager) {
                    result.roles.push(Roles.manager);
                    result.isManager = true
                }
                else if (u.social) {
                    result.roles.push(Roles.social);
                    result.isSocial = true
                }
                else if (u.site) {
                    result.roles.push(Roles.site);
                    result.isSite = true
                }
            }
        }
 
        if (result!) {
            return (jwt.sign(result, getJwtSecret()));
        }
        throw new Error(terms.invalidSignIn);
    }
}
export function getJwtSecret() {
    if (process.env['NODE_ENV'] === "production")
        return process.env['TOKEN_SIGN_KEY']!;
    return process.env['JWT_SECRET']!;
}