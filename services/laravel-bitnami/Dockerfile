FROM bitnami/laravel:8-debian-10

# Here is our demo app
# Purely init the project by using `composer create-project laravel/laravel 8.5.20 laravel-8.5.20` in CLI
# you can replace your Laravel project code in laravel-8.5.20, or even change the folder name
COPY --chown=bitnami:bitnami laravel-8.5.20 ./
RUN set -x && \
    # please remove this APP_KEY generate for your production usage
    #   - ref: https://tighten.co/blog/app-key-and-you/
    php artisan key:generate

ENTRYPOINT []
CMD [ "php", "artisan", "serve", "--host=0.0.0.0", "--port=3000" ]