import { Schema, model } from 'mongoose';


const ItemSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        done: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);


export default model('Item', ItemSchema);