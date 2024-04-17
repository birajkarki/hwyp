package com.example.hwyp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Registration extends AppCompatActivity {

    TextInputEditText textInputEditTextName, textInputEditTextEmail, textInputEditTextPassword;
    Button buttonSubmit;
    TextView textViewError;
    ProgressBar progressBar;

    private static final String TAG = "RegistrationActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        textInputEditTextName = findViewById(R.id.name);
        textInputEditTextEmail = findViewById(R.id.email);
        textInputEditTextPassword = findViewById(R.id.password);
        buttonSubmit = findViewById(R.id.submit);
        textViewError = findViewById(R.id.error);
        progressBar = findViewById(R.id.loading);

        buttonSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                textViewError.setVisibility(View.GONE);
                progressBar.setVisibility(View.VISIBLE);

                final String name = String.valueOf(textInputEditTextName.getText());
                final String email = String.valueOf(textInputEditTextEmail.getText());
                final String password = String.valueOf(textInputEditTextPassword.getText());

                RequestQueue queue = Volley.newRequestQueue(getApplicationContext());
                String url = "http://192.168.18.37:3000/signup";

                StringRequest stringRequest = new StringRequest(Request.Method.POST, url,
                        new Response.Listener<String>() {
                            @Override
                            public void onResponse(String response) {
                                progressBar.setVisibility(View.GONE);
                                try {
                                    JSONObject jsonResponse = new JSONObject(response);
                                    String status = jsonResponse.getString("status");
                                    if (status.equals("success")) {
                                        Toast.makeText(getApplicationContext(), "Registration Successful", Toast.LENGTH_SHORT).show();
                                        Intent intent = new Intent(getApplicationContext(), Login.class);
                                        startActivity(intent);
                                        finish();
                                    } else {
                                        String errorMessage = jsonResponse.getString("message");
                                        textViewError.setText(errorMessage);
                                        textViewError.setVisibility(View.VISIBLE);
                                    }
                                } catch (JSONException e) {
                                    Log.e(TAG, "JSON parsing error: " + e.getMessage());
                                    textViewError.setText("Error: JSON parsing error");
                                    textViewError.setVisibility(View.VISIBLE);
                                }
                            }
                        }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        progressBar.setVisibility(View.GONE);
                        Log.e(TAG, "Volley error: " + error.getMessage());
                        textViewError.setText("Error: " + error.getMessage());
                        textViewError.setVisibility(View.VISIBLE);
                        // Log the stack trace for further investigation
                        error.printStackTrace();
                    }
                }) {
                    @Override
                    protected Map<String, String> getParams() {
                        Map<String, String> params = new HashMap<>();
                        params.put("name", name);
                        params.put("email", email);
                        params.put("password", password);
                        return params;
                    }
                };

                // Set timeout here
                int timeout = 10000; // Timeout in milliseconds (e.g., 10 seconds)
                stringRequest.setRetryPolicy(new DefaultRetryPolicy(
                        timeout,
                        DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                        DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
                ));

                queue.add(stringRequest);
            }
        });
    }
}
