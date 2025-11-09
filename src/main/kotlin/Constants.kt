package net.raphdf201

import java.util.concurrent.locks.ReentrantLock

class Constants {
    class Database {
        companion object {
            const val URL = "jdbc:mariadb://192.168.1.14:3306/taskmanager"
            const val USER = "taskmgr"
            const val DRIVER = "org.mariadb.jdbc.Driver"
            const val PASSWORD = "TaskManagerPw124!"
        }
    }

    class Auth {
        companion object {
            const val CALLBACK = "https://commtasks.raphdf201.net/callback"
            const val NAME = "google"
            const val AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/auth"
            const val ACCESS_TOKEN_URL = "https://accounts.google.com/o/oauth2/token"
            const val CLIENT_ID = "963962680553-ju8joh4ct4qeevmu4n132t48slk77vq5.apps.googleusercontent.com"
            const val CLIENT_SECRET = "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"
            val DEFAULT_SCOPES = listOf("https://www.googleapis.com/auth/userinfo.profile")
        }
    }

    class Static {
        companion object {
            const val TASKS = "/index.html"
            const val LOGIN = "/login.html"
        }
    }

    class Logs {
        companion object {
            const val LOG = "logs"
            const val SIZE_CHECK_INTERVAL = 100
            val lock = ReentrantLock()
            var lastSizeCheck = 0L
        }
    }
}
