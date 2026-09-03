package com.babytrack.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.babytrack.app.data.Event
import com.babytrack.app.data.EventType
import com.babytrack.app.util.formatClockTime
import com.babytrack.app.util.formatDateHeader
import com.babytrack.app.viewmodel.EventViewModel
import java.util.Calendar

private fun dayKey(timestamp: Long): Long {
    val cal = Calendar.getInstance()
    cal.timeInMillis = timestamp
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}

private fun labelFor(type: String): String =
    EventType.entries.firstOrNull { it.name == type }?.label ?: type

@Composable
fun HistoryScreen(viewModel: EventViewModel) {
    val events by viewModel.allEvents.collectAsState(initial = emptyList())

    if (events.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No entries yet. Log something on the Home tab.")
        }
        return
    }

    val grouped = remember(events) { events.groupBy { dayKey(it.timestamp) } }
    val sortedDays = remember(grouped) { grouped.keys.sortedDescending() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        sortedDays.forEach { day ->
            item(key = "header_$day") {
                Text(
                    text = formatDateHeader(day),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)
                )
            }
            val dayEvents = grouped[day].orEmpty()
            items(dayEvents, key = { it.id }) { event ->
                EventRow(event)
            }
        }
    }
}

@Composable
private fun EventRow(event: Event) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = labelFor(event.type))
            Text(text = formatClockTime(event.timestamp))
        }
    }
}
