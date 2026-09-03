package com.babytrack.app.data

import kotlinx.coroutines.flow.Flow

class EventRepository(private val dao: EventDao) {

    fun getAllEvents(): Flow<List<Event>> = dao.getAllEvents()

    suspend fun logEvent(type: EventType, timestamp: Long): Event {
        val id = dao.insert(Event(type = type.name, timestamp = timestamp))
        return Event(id = id, type = type.name, timestamp = timestamp)
    }

    suspend fun deleteEvent(event: Event) = dao.delete(event)
}
