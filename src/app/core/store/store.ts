import { Allow, Entity, Fields, IdEntity } from "remult";

@Entity('stores', (options, remult) => {
    options.allowApiCrud = Allow.authenticated
})
export class Store extends IdEntity {

    @Fields.string()
    name = ''

}
