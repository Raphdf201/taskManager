package net.raphdf201

import java.util.concurrent.locks.ReentrantLock

class Constants {
    class Database {
        companion object {
            const val URL = "jdbc:POSTGRES://IP:3306/taskmanager"
            const val USER = "USER"
            const val DRIVER = "org.mariadb.jdbc.Driver"
            const val PASSWORD = "PASSWORD"
        }
    }

    class Auth {
        companion object {
            const val CALLBACK = "https://DOMAIN.raphdf201.net/callback"
            const val NAME = "google"
            const val AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/auth"
            const val ACCESS_TOKEN_URL = "https://accounts.google.com/o/oauth2/token"
            const val CLIENT_ID = "ID"
            const val CLIENT_SECRET = "SECRET"
            val DEFAULT_SCOPES = listOf("https://www.googleapis.com/auth/userinfo.profile")
        }
    }

    class Static {
        companion object {
            const val FRONTEND = "/index.html"
            const val DEV_FRONTEND = "http://localhost:5173/index.html"
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
