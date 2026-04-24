package com.zyntracare.di

import android.content.Context
import androidx.room.Room
import com.zyntracare.data.local.SessionManager
import com.zyntracare.data.local.db.HospitalDao
import com.zyntracare.data.local.db.LabDao
import com.zyntracare.data.local.db.PharmacyDao
import com.zyntracare.data.local.db.UserDao
import com.zyntracare.data.local.db.ZyntraCareDatabase
import com.zyntracare.data.remote.ApiService
import com.zyntracare.data.repository.UserRepositoryImpl
import com.zyntracare.domain.repository.UserRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    private const val BASE_URL = "https://zyntracare.vercel.app/"

    @Provides
    @Singleton
    fun provideOkHttpClient(sessionManager: SessionManager): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor { chain ->
                val token = runBlocking { sessionManager.token.first() }
                val request = chain.request().newBuilder()
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .apply {
                        if (!token.isNullOrEmpty()) {
                            addHeader("Authorization", "Bearer $token")
                        }
                    }
                    .build()
                chain.proceed(request)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context): SessionManager {
        return SessionManager(context)
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): ZyntraCareDatabase {
        return Room.databaseBuilder(
            context,
            ZyntraCareDatabase::class.java,
            "zyntracare_db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    @Singleton
    fun provideUserDao(database: ZyntraCareDatabase): UserDao {
        return database.userDao()
    }

    @Provides
    @Singleton
    fun provideHospitalDao(database: ZyntraCareDatabase): HospitalDao {
        return database.hospitalDao()
    }

    @Provides
    @Singleton
    fun provideLabDao(database: ZyntraCareDatabase): LabDao {
        return database.labDao()
    }

    @Provides
    @Singleton
    fun providePharmacyDao(database: ZyntraCareDatabase): PharmacyDao {
        return database.pharmacyDao()
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}