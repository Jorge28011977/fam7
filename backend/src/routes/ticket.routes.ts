import { Router } from 'express';
import { createTicket, getTickets, updateTicketStatus } from '../controllers/ticket.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'BANK_MANAGER'), createTicket);
router.get('/', protect, getTickets);
router.patch('/:id/status', protect, restrictTo('ADMIN', 'TECHNICIAN'), updateTicketStatus);

export default router;
