# ─────────────────────────────────────────────────────────────
# Laravel 12 backend — PHP 8.2 + Apache (mod_php)
# ─────────────────────────────────────────────────────────────
FROM php:8.2-apache

# System libraries required by the PHP extensions below
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring bcmath gd zip exif pcntl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Trust any local TLS-intercepting proxy CA (corporate proxy / antivirus such as
# Avast) so Composer/git can fetch over HTTPS while building. This is a no-op when
# docker/certs only contains the .gitkeep placeholder (e.g. on a normal network).
COPY docker/certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates

# Composer (copied from the official image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache: enable rewrite + headers and serve Laravel's public/ directory
RUN a2enmod rewrite headers
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# Custom PHP settings (upload limits, memory, etc.)
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/html

# Install PHP dependencies first so this layer is cached across code changes
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# Copy the rest of the application and finish the autoloader
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint: waits for the DB, migrates, links storage, then runs the CMD
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint && chmod +x /usr/local/bin/entrypoint

EXPOSE 80
ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
