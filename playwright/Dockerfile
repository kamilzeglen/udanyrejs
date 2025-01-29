# Bazowy obraz z Playwright
FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /playwridgt

# Expose port dla serwera Playwrightt
EXPOSE 6006

# Uruchomienie Playwright
CMD ["npx", "-y", "playwright@1.49.0", "run-server", "--port", "6006", "--host", "0.0.0.0"]
