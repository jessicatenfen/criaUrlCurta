import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  originalUrl: string = ''; 
  shortenedUrl: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) { }

  shortenUrl() { // Removed url parameter, now using originalUrl
    this.loading = true;
    this.error = '';
    this.shortenedUrl = '';

    //Improved URL validation
    if(!this.isValidUrl(this.originalUrl)){
        this.loading = false;
        this.error = "Please enter a valid URL";
        return;
    }

    const apiUrl = environment.apiUrl;

    console.log(apiUrl); // Log the full response for debugging

    const expirationTimeInSeconds = this.getExpirationTime();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Adjust as needed for your API
  });

    //This is the key change - ensure the JSON is correctly formatted
    const requestBody = JSON.stringify({ 
      "originalUrl": this.originalUrl, 
      "expirationTime": expirationTimeInSeconds.toString()
  });

  console.log("Request Body (JSON.stringify):", requestBody); //Check the stringified JSON

    this.http.post<{  code: number, shortenedUrl: string }>(apiUrl, { originalUrl: this.originalUrl, expirationTime: expirationTimeInSeconds.toString() }, { headers })
      .subscribe({
        next: response => {
          //console.log("Response from API:", response); // Log the full response for debugging
          const shortenedId = response.code; // Capture the shortenedId

          const apiReturn = environment.apiKey;
          this.shortenedUrl = apiReturn + shortenedId;
          

          console.log("Shortened URL:", this.shortenedUrl); //Log the shortened ID
          this.loading = false;
        },
        error: err => {
          console.error('Error shortening URL:', err);
          this.error = `Error: ${err.error?.message || err.message || 'An unexpected error occurred.'}`;
          this.loading = false;
        }
      });
  }

  //This is the new and simpler version
  getExpirationTime(): number {
    const now = new Date();
    const expirationTimeMillis = now.getTime() + (24 * 60 * 60 * 1000);
    const expirationTimeInSeconds = Math.floor(expirationTimeMillis / 1000);
    return expirationTimeInSeconds;
  }

  //Helper function for URL validation
  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

}