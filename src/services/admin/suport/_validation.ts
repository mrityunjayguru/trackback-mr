import { model } from "mongoose";
import Joi from 'joi';
import { suportSchema } from "../../../models/suport";
export const suport = model('suport', suportSchema);
export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        deviceID: Joi.string().required().label('deviceID'),
        userId: Joi.string().required().email().label('userId'),
        suport: Joi.string().required().label('suport'),
        description: Joi.string().required().email().label('description')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

