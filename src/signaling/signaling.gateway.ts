import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({ cors: true })
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private rooms: Map<string, Set<string>> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.rooms.forEach((participants, roomId) => {
            if (participants.has(client.id)) {
                participants.delete(client.id);
                client.to(roomId).emit('participant-left', { participantId: client.id });
                if (participants.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        });
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(client: Socket, roomId: string) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        // const participants = this.rooms.get(roomId) || undefined;
        const participants = this.rooms.get(roomId) as Set<string>;
        participants.add(client.id);
        client.join(roomId);

        // Notify existing participants
        client.to(roomId).emit('new-participant', { participantId: client.id });

        // Send existing participants to the new joiner
        const otherParticipants = Array.from(participants)
            .filter(id => id !== client.id);
        client.emit('existing-participants', { participants: otherParticipants });
    }

    @SubscribeMessage('relay-ice')
    handleIceCandidate(client: Socket, payload: { targetId: string; candidate: any }) {
        client.to(payload.targetId).emit('ice-candidate', {
            senderId: client.id,
            candidate: payload.candidate
        });
    }

    @SubscribeMessage('relay-sdp')
    handleSDP(client: Socket, payload: { targetId: string; sessionDescription: any }) {
        client.to(payload.targetId).emit('session-description', {
            senderId: client.id,
            sessionDescription: payload.sessionDescription
        });
    }
}