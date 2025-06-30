        // Variables globales
        let audioContext;
        let analyser;
        let audioSource;
        let dataArray;
        let isVisualizerActive = false;
        let currentTrackIndex = 0;

        const audioPlayer = document.getElementById('audioPlayer');
        const canvas = document.getElementById('cavaCanvas');
        const ctx = canvas.getContext('2d');
        
        // Playlist de ejemplo (podrás reemplazar con tus archivos)
        const playlist = [
            {
                title: "Different varieties",
                artist: "KINGMOSTWANTED",
                cover : "img/album.jpeg",
                // Aquí deberías poner la ruta real de tu archivo de audio
                src: "audio/dif.mp3"
            },
            {
                title: "Nope your too late i already died",
                artist: "wifiskeleton",
                cover: "img/nopeim.jpeg",
                src: "audio/Nope.mp3"
            },
            {
                title: "i love freaks",
                artist: "Liljay",
                cover: "img/ilovefreaksimage.jpeg",
                src: "audio/ilovefreaks.mp3"
            }
        ];

        // Configurar canvas
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }

        // Inicializar visualizador
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                
                audioSource = audioContext.createMediaElementSource(audioPlayer);
                audioSource.connect(analyser);
                audioSource.connect(audioContext.destination);
                
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                isVisualizerActive = true;
                drawVisualizer();
            }
        }

        // Dibujar visualizador
        function drawVisualizer() {
            if (!isVisualizerActive) return;

            requestAnimationFrame(drawVisualizer);
            
            analyser.getByteFrequencyData(dataArray);
            
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Limpiar canvas
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
            ctx.fillRect(0, 0, width, height);
            
            const barWidth = width / dataArray.length * 2;
            let x = 0;
            
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * height * 0.8;
                
                // Gradiente de color basado en la frecuencia
                const hue = (i / dataArray.length) * 360;
                const saturation = 70;
                const lightness = 50 + (dataArray[i] / 255) * 30;
                
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
                
                // Efecto de brillo
                ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.6)`;
                ctx.fillRect(x, height - barHeight, barWidth - 1, Math.min(barHeight, 10));
                
                x += barWidth;
            }
        }

        // Control de música
            function loadTrack(index) {
                const track = playlist[index];
                if (!track) return;

                document.getElementById('songTitle').textContent = track.title;
                document.getElementById('songArtist').textContent = track.artist;

                const albumArt = document.getElementById('albumArt');
                if (track.cover && track.cover.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
                 albumArt.innerHTML = `<img src="${track.cover}" alt="Portada" style="width:100%;height:100%;object-fit:cover;border-radius:15px;">`;
                } else {
                    albumArt.textContent = track.cover || '🎵';
                }

                audioPlayer.src = track.src;
                audioPlayer.load();
                console.log(`Cargando: ${track.title} - ${track.artist}`);
            }

        function togglePlayPause() {
            const playBtn = document.getElementById('playBtn');
            
            if (audioPlayer.paused) {
                // Inicializar contexto de audio en el primer play
                if (!audioContext) {
                    initAudioContext();
                }
                
                // Reproducir audio real
                audioPlayer.play().then(() => {
                    playBtn.textContent = '⏸';
                    isVisualizerActive = true;
                    if (!dataArray) dataArray = new Uint8Array(analyser.frequencyBinCount);
                    drawVisualizer();
                }).catch(error => {
                    console.error('Error al reproducir audio:', error);
                    // Fallback a simulación si hay error
                    playBtn.textContent = '⏸';
                    startSimulation();
                });
            } else {
                audioPlayer.pause();
                playBtn.textContent = '▶';
                isVisualizerActive = false;
                stopSimulation();
            }
        }

        function nextTrack() {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
            
            // Si estaba reproduciendo, continuar con la nueva canción
            const playBtn = document.getElementById('playBtn');
            if (playBtn.textContent === '⏸') {
                setTimeout(() => {
                    audioPlayer.play().then(() => {
                        isVisualizerActive = true;
                        drawVisualizer();
                    }).catch(error => {
                        console.error('Error al reproducir siguiente canción:', error);
                        startSimulation();
                    });
                }, 100);
            }
        }

        function previousTrack() {
            currentTrackIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
            loadTrack(currentTrackIndex);
            
            // Si estaba reproduciendo, continuar con la nueva canción
            const playBtn = document.getElementById('playBtn');
            if (playBtn.textContent === '⏸') {
                setTimeout(() => {
                    audioPlayer.play().then(() => {
                        isVisualizerActive = true;
                        drawVisualizer();
                    }).catch(error => {
                        console.error('Error al reproducir canción anterior:', error);
                        startSimulation();
                    });
                }, 100);
            }
        }

        // Simulación de audio (para demo recordatorio eliminar despues)
        let simulationInterval;
        function startSimulation() {
            if (!dataArray) dataArray = new Uint8Array(128);
            
            simulationInterval = setInterval(() => {
                for (let i = 0; i < dataArray.length; i++) {
                    dataArray[i] = Math.random() * 255 * (Math.sin(Date.now() * 0.001 + i * 0.1) * 0.5 + 0.5);
                }
            }, 16);
            
            if (!isVisualizerActive) {
                isVisualizerActive = true;
                drawVisualizer();
            }
        }

        function stopSimulation() {
            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
            }
            isVisualizerActive = false;
        }

        // Control de volumen
        document.getElementById('volumeSlider').addEventListener('input', function(e) {
            audioPlayer.volume = e.target.value / 100;
        });

        // Tema oscuro/claro
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? null : 'light';
            document.documentElement.setAttribute('data-theme', newTheme || '');
            localStorage.setItem('theme', newTheme || 'dark');
        }

        // Cargar tema guardado
        function loadSavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }

        // Auto-play siguiente canción
        audioPlayer.addEventListener('ended', nextTrack);

        // Inicialización
        window.addEventListener('load', () => {
            loadSavedTheme();
            resizeCanvas();
            loadTrack(0);
        });

        window.addEventListener('resize', resizeCanvas)
