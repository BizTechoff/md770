import { remultExpress } from 'remult/remult-express';
import { createPostgresConnection } from 'remult/postgres';
import { User } from '../app/users/user';
import { SignInController } from '../app/users/SignInController';
import { UpdatePasswordController } from '../app/users/UpdatePasswordController';
import { config } from 'dotenv';
import { Product } from '../app/core/product/product';
import { Store } from '../app/core/store/store';

config()

export const api = remultExpress({
    entities: [User, Product, Store],
    controllers: [SignInController, UpdatePasswordController],
    dataProvider: async () => {
        // if (process.env['NODE_ENV'] === "production")
            return createPostgresConnection({ configuration: "heroku" })
        // return undefined;
    }
});