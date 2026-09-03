package com.babytrack.app.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun formatElapsedSince(timestamp: Long, now: Long = System.currentTimeMillis()): String {
    val diffMillis = (now - timestamp).coerceAtLeast(0)
    val minutes = diffMillis / 60_000
    val hours = minutes / 60
    val days = hours / 24

    return when {
        minutes < 1 -> "just now"
        minutes < 60 -> "${minutes}m ago"
        hours < 24 -> "${hours}h ${minutes % 60}m ago"
        else -> "${days}d ${hours % 24}h ago"
    }
}

fun formatClockTime(timestamp: Long): String {
    val sdf = SimpleDateFormat("h:mm a", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

fun formatDateHeader(timestamp: Long): String {
    val sdf = SimpleDateFormat("EEEE, MMM d", Locale.getDefault())
    return sdf.format(Date(timestamp))
}
