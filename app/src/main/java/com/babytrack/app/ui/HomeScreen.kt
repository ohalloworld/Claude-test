package com.babytrack.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.babytrack.app.data.EventType
import com.babytrack.app.util.formatElapsedSince
import com.babytrack.app.viewmodel.EventViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(viewModel: EventViewModel) {
    val state by viewModel.homeUiState.collectAsState()
    var now by remember { mutableStateOf(System.currentTimeMillis()) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        while (true) {
            delay(30_000)
            now = System.currentTimeMillis()
        }
    }

    fun logWithUndo(type: EventType, label: String) {
        scope.launch {
            val event = viewModel.logEventAwait(type)
            val result = snackbarHostState.showSnackbar(
                message = "$label logged",
                actionLabel = "Undo",
                withDismissAction = true
            )
            if (result == SnackbarResult.ActionPerformed) {
                viewModel.deleteEvent(event)
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Baby Tracker",
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            item {
                TrackerButton(
                    title = "Pain Meds",
                    subtitle = state.lastPainMeds?.let { "Last: ${formatElapsedSince(it, now)}" }
                        ?: "Not logged yet",
                    onClick = { logWithUndo(EventType.PAIN_MEDS, "Pain meds") }
                )
            }
            item {
                TrackerButton(
                    title = "Feeding",
                    subtitle = state.lastFeeding?.let { "Last: ${formatElapsedSince(it, now)}" }
                        ?: "Not logged yet",
                    onClick = { logWithUndo(EventType.FEEDING, "Feeding") }
                )
            }
            item {
                TrackerButton(
                    title = if (state.isSleeping) "End Sleep" else "Start Sleep",
                    subtitle = if (state.isSleeping && state.sleepStartedAt != null) {
                        "Sleeping for ${formatElapsedSince(state.sleepStartedAt!!, now)}"
                    } else {
                        "Not sleeping"
                    },
                    onClick = {
                        val type = if (state.isSleeping) EventType.SLEEP_END else EventType.SLEEP_START
                        val label = if (state.isSleeping) "Sleep ended" else "Sleep started"
                        logWithUndo(type, label)
                    }
                )
            }
            item {
                TrackerButton(
                    title = "Wet Nappy",
                    subtitle = "Today: ${state.wetNappyCountToday}",
                    onClick = { logWithUndo(EventType.WET_NAPPY, "Wet nappy") }
                )
            }
            item {
                TrackerButton(
                    title = "Poo Nappy",
                    subtitle = "Today: ${state.poopNappyCountToday}",
                    onClick = { logWithUndo(EventType.POO_NAPPY, "Poo nappy") }
                )
            }
        }
    }
}

@Composable
private fun TrackerButton(title: String, subtitle: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 88.dp)
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = subtitle, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
