import { Allow, Entity, Fields, IdEntity } from "remult";

@Entity('products', (options, remult) => {
    options.allowApiCrud = Allow.authenticated
})
export class Product extends IdEntity {

    @Fields.string()
    name = ''

}
