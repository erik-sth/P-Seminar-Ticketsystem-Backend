import Joi from 'joi';
import mongoose, { Schema, Model } from 'mongoose';
import { Ticket } from '../types/ticket.types';

// Ticket schema
const ticketSchema = new Schema<Ticket>({
    firstName: { type: String, minlength: 3, maxlength: 50, required: true },
    lastName: { type: String, minlength: 3, maxlength: 50, required: true },
    isCheckedIn: { type: Boolean, default: false },
    projectId: { type: Schema.Types.ObjectId, ref: 'project', required: true },
});

// Ticket Model
const TicketModel: Model<Ticket> = mongoose.model('ticket', ticketSchema);

function validateSchema(ticket: Partial<Ticket>) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required().label('First Name'),
        lastName: Joi.string().min(3).max(50).required().label('Last Name'),
    });

    const { error } = schema.validate({
        firstName: ticket.firstName,
        lastName: ticket.lastName,
    });

    return { error };
}

export { TicketModel as Ticket, validateSchema };
