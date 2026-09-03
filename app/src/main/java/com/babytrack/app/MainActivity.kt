package com.babytrack.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.babytrack.app.ui.BabyTrackApp
import com.babytrack.app.ui.theme.BabyTrackerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BabyTrackerTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    BabyTrackApp()
                }
            }
        }
    }
}
