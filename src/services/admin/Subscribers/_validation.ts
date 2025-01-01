import { model } from "mongoose";
import Joi from 'joi';
import { usersSchema } from "../../../models/users";
export const subscriber = model('subscriber', usersSchema);
export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        userName: Joi.string().required().label('User Name'),
        emailAddress: Joi.string().required().email().label('Email Address')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

