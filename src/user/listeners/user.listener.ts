import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent, UserLoggedInEvent } from '../events/user.events';
import { logToFile } from '../../../utils/logger';

@Injectable()
export class UserListener {
    @OnEvent('user.created')
    handleUserCreatedEvent(event: UserCreatedEvent) {
        const message = `Welcome email sent to ${event.email} (User ID: ${event.userId})`;
        console.log(message);
        void logToFile(message, 'user');
    }

    @OnEvent('user.login')
    handleUserLoginEvent(event: UserLoggedInEvent) {
        const message = `User logged in: ${event.userId}`;
        console.log(message);
        void logToFile(message, 'auth');
    }
}
