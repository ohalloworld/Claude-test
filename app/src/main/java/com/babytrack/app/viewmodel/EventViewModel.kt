package com.babytrack.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.babytrack.app.data.AppDatabase
import com.babytrack.app.data.Event
import com.babytrack.app.data.EventRepository
import com.babytrack.app.data.EventType
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar

data class HomeUiState(
    val lastPainMeds: Long? = null,
    val lastFeeding: Long? = null,
    val isSleeping: Boolean = false,
    val sleepStartedAt: Long? = null,
    val wetNappyCountToday: Int = 0,
    val poopNappyCountToday: Int = 0
)

class EventViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: EventRepository = EventRepository(
        AppDatabase.getInstance(application).eventDao()
    )

    val allEvents = repository.getAllEvents()

    val homeUiState = allEvents
        .map { events -> buildHomeState(events) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    private fun buildHomeState(events: List<Event>): HomeUiState {
        val todayStart = startOfToday()
        val todayEvents = events.filter { it.timestamp >= todayStart }

        val lastPainMeds = events.firstOrNull { it.type == EventType.PAIN_MEDS.name }?.timestamp
        val lastFeeding = events.firstOrNull { it.type == EventType.FEEDING.name }?.timestamp

        val lastSleepEvent = events.firstOrNull {
            it.type == EventType.SLEEP_START.name || it.type == EventType.SLEEP_END.name
        }
        val isSleeping = lastSleepEvent?.type == EventType.SLEEP_START.name
        val sleepStartedAt = if (isSleeping) lastSleepEvent?.timestamp else null

        return HomeUiState(
            lastPainMeds = lastPainMeds,
            lastFeeding = lastFeeding,
            isSleeping = isSleeping,
            sleepStartedAt = sleepStartedAt,
            wetNappyCountToday = todayEvents.count { it.type == EventType.WET_NAPPY.name },
            poopNappyCountToday = todayEvents.count { it.type == EventType.POO_NAPPY.name }
        )
    }

    suspend fun logEventAwait(type: EventType): Event {
        return repository.logEvent(type, System.currentTimeMillis())
    }

    fun deleteEvent(event: Event) {
        viewModelScope.launch { repository.deleteEvent(event) }
    }

    private fun startOfToday(): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }
}
