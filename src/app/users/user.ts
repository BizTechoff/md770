import { DataControl } from "@remult/angular/interfaces";
import { Allow, BackendMethod, Entity, Fields, IdEntity, isBackend, Validators } from "remult";
import { datetimeFormat } from "../common/utils";
import { terms } from "../terms";
import { Roles } from './roles';

@Entity<User>("Users", (options, remult) => {
    options.allowApiRead = Allow.authenticated
    options.allowApiUpdate = Allow.authenticated
    options.allowApiDelete = Roles.admin
    options.allowApiInsert = Roles.admin
    options.defaultOrderBy = {
        admin: "desc",
        manager: "desc",
        social: "desc",
        site: "desc",
        name: "asc"
    }
},
    (options, remult) => {
        options.apiPrefilter = !remult.isAllowed(Roles.admin) ? { id: remult.user.id } : {};
        options.saving = async (user) => {
            if (isBackend()) {
                if (user._.isNew()) {
                    user.createDate = new Date();
                }
            }
        }
    }
)
export class User extends IdEntity {

    @DataControl<User, string>({ width: '118' })
    @Fields.string<User>({
        validate: [Validators.required.withMessage(terms.requiredField), Validators.uniqueOnBackend.withMessage(terms.uniqueField)],
        caption: terms.username
    })
    name = '';

    @Fields.string({ includeInApi: false })
    password = '';

    @Fields.date({
        caption: terms.createDate,
        allowApiUpdate: false,
        displayValue: (row, col) => datetimeFormat(col),
    })
    createDate = new Date();

    @DataControl<User, boolean>({
        width: '88',
        valueChange: (row, col) => {
            if (col.value) {
                row.manager = false
                row.social = false
                row.site = false
            }
        }
    })
    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.admin
    })
    admin = false;

    @DataControl<User, boolean>({
        width: '88',
        valueChange: (row, col) => {
            if (col.value) {
                row.admin = false
                row.social = false
                row.site = false
            }
        }
    })
    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.manager
    })
    manager = false;

    @DataControl<User, boolean>({
        width: '88',
        valueChange: (row, col) => {
            if (col.value) {
                row.admin = false
                row.manager = false
                row.site = false
            }
        }
    })
    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.social
    })
    social = false;

    @DataControl<User, boolean>({
        width: '88',
        valueChange: (row, col) => {
            if (col.value) {
                row.admin = false
                row.manager = false
                row.social = false
            }
        }
    })
    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.site
    })
    site = false;

    async hashAndSetPassword(password: string) {
        this.password = (await import('password-hash')).generate(password);
    }
    async passwordMatches(password: string) {
        return !this.password || (await import('password-hash')).verify(password, this.password);
    }
    @BackendMethod({ allowed: Roles.admin })
    async resetPassword() {
        this.password = '';
        await this.save();
    }
}