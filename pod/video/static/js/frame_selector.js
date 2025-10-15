// On encapsule tout le code dans une fonction anonyme pour éviter de polluer l'espace global.
(function() {
    // On attend que le DOM soit entièrement chargé.
    document.addEventListener('DOMContentLoaded', function () {
        const videoElement = document.getElementById('thumbnail-video-player');
        
        // Si l'élément vidéo n'existe pas sur la page, on ne fait rien.
        if (!videoElement) {
            return;
        }

        const videoUrl = videoElement.getAttribute('data-src');

        // Sécurité : si l'URL n'est pas trouvée, on arrête et on affiche une erreur en console.
        if (!videoUrl) {
            console.error('Erreur : URL de la source vidéo non trouvée (attribut data-src manquant).');
            return;
        }

        // --- Initialisation robuste de Video.js ---
        const videoOptions = {
            controls: true,
            autoplay: false,
            preload: 'auto',
            sources: [{
                src: videoUrl,
                type: 'video/mp4'
            }]
        };

        // On initialise le lecteur en une seule fois avec l'élément et les options.
        var player = videojs(videoElement, videoOptions);

        // Notre code personnalisé s'exécutera seulement quand le lecteur est 100% prêt.
        player.ready(function() {
            const prevFrameBtn = document.getElementById('frame-prev');
            const nextFrameBtn = document.getElementById('frame-next');
            const validateFrameBtn = document.getElementById('validate-frame');
            
            const canvas = document.getElementById('thumbnail-canvas');
            const hiddenInput = document.getElementById('thumbnail-data-url');
            const previewContainer = document.getElementById('thumbnail-preview-container');
            const previewImage = document.getElementById('thumbnail-preview-image');

            // Durée approximative d'une image (pour une vidéo à 25 i/s)
            const FRAME_DURATION = 1 / 25; 

            if (prevFrameBtn && nextFrameBtn) {
                // --- Contrôle image par image ---
                prevFrameBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    player.pause(); // <-- LA CORRECTION : On met en pause avant de bouger.
                    const newTime = player.currentTime() - FRAME_DURATION;
                    player.currentTime(Math.max(0, newTime)); // On ne va pas en dessous de 0.
                });

                nextFrameBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    player.pause(); // <-- LA CORRECTION : On met en pause avant de bouger.
                    const newTime = player.currentTime() + FRAME_DURATION;
                    if (newTime < player.duration()) { // On ne dépasse pas la durée totale.
                        player.currentTime(newTime);
                    }
                });
            }

            // --- Validation de l'image ---
            if (validateFrameBtn) {
                validateFrameBtn.addEventListener('click', function(event) {
                    event.preventDefault();

                    const internalVideoEl = player.el().querySelector('video');
                    const context = canvas.getContext('2d');

                    canvas.width = player.videoWidth();
                    canvas.height = player.videoHeight();
                    
                    context.drawImage(internalVideoEl, 0, 0, canvas.width, canvas.height);

                    const dataURL = canvas.toDataURL('image/jpeg', 0.9);

                    hiddenInput.value = dataURL;
                    previewImage.src = dataURL;
                    previewContainer.style.display = 'block';

                    alert("Vignette sélectionnée. N'oubliez pas de sauvegarder les modifications.");
                });
            }
        });

        // Gestion des erreurs pour le débogage.
        player.on('error', function() {
            console.error('Erreur Video.js :', player.error());
        });
    });
})();