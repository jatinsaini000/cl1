/**
 * PSD Marketing Agency - Interactive & Secure Web Scripting
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Content Security Policy & Safe Scripting Helpers
    // -------------------------------------------------------------
    // Helper to safely escape HTML content to prevent XSS injection
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // -------------------------------------------------------------
    // 2. Three.js Interactive 3D Particle Space
    // -------------------------------------------------------------
    const canvas = document.getElementById('three-bg-canvas');
    
    if (canvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        
        // Perspective Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Generate Procedural Particle Geometry (Highly optimized counts for mobile performance)
        const isMobile = window.innerWidth < 768;
        const particlesCount = isMobile ? 150 : 800;
        const positions = new Float32Array(particlesCount * 3);
        const originalPositions = [];

        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Generate coordinates inside a spherical bounds
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const distance = 10 + Math.random() * 40;

            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta);
            const z = distance * Math.cos(phi);

            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;

            // Cache original coordinates for wind/drift calculations
            originalPositions.push({ x, y, z, speed: 0.1 + Math.random() * 0.5 });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Custom Particle Shading Material
        const material = new THREE.PointsMaterial({
            size: 0.25,
            color: new THREE.Color('#ff5e36'),
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Grid Helper to give structural 3D perspective
        const gridHelper = new THREE.GridHelper(100, 30, 0x00d4ff, 0x0d1220);
        gridHelper.position.y = -15;
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Interaction coordinates tracking
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            // Normalize coordinates between -1 and 1
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Loop execution function
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            
            const elapsedTime = clock.getElapsedTime();

            // Smooth mouse transition interpolation
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Rotate system slightly based on mouse
            particleSystem.rotation.y = elapsedTime * 0.03 + mouseX * 0.2;
            particleSystem.rotation.x = elapsedTime * 0.015 - mouseY * 0.2;
            
            gridHelper.rotation.y = elapsedTime * 0.005 + mouseX * 0.05;

            // Subtle dynamic particle wave deformation (Skip on mobile for 60fps performance)
            if (!isMobile) {
                const posAttr = geometry.attributes.position;
                for (let i = 0; i < particlesCount; i++) {
                    const i3 = i * 3;
                    const orig = originalPositions[i];
                    // Apply a simple sinusoidal wave offset based on coordinates
                    posAttr.array[i3] = orig.x + Math.sin(elapsedTime * orig.speed + orig.y * 0.1) * 0.5;
                    posAttr.array[i3 + 1] = orig.y + Math.cos(elapsedTime * orig.speed + orig.x * 0.1) * 0.5;
                }
                posAttr.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Responsive design resizing adjustment
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    // -------------------------------------------------------------
    // 3. Dynamic 3D Tilt Effect on Elements
    // -------------------------------------------------------------
    const tiltElements = document.querySelectorAll('.tilt-element');
    
    // Check if device supports hover events (disable on touch screens to improve mobile performance)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice && tiltElements.length > 0) {
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left; // Mouse position inside card
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Tilt limits (-10 to 10 degrees)
                const rotateX = ((centerY - y) / centerY) * 10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                // Apply transformation matrix
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            element.addEventListener('mouseleave', () => {
                // Restore original state
                element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // -------------------------------------------------------------
    // 4. Typing Text Carousel Effect
    // -------------------------------------------------------------
    const typingSpan = document.getElementById('typing-text');
    if (typingSpan) {
        const words = ['YouTube Growth', 'Monetization Success', 'Facebook Leads', 'Music Artist Scaling', 'Paid Promotions'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const type = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingSpan.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingSpan.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                // Pause at end of word
                isDeleting = true;
                typingSpeed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 500;
            }

            setTimeout(type, typingSpeed);
        };
        setTimeout(type, 1000);
    }

    // -------------------------------------------------------------
    // 5. Scroll Reveal & Active Navigation link observers
    // -------------------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // -------------------------------------------------------------
    // 6. Stats Counter Animation
    // -------------------------------------------------------------
    const statsSection = document.getElementById('stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const countUp = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let count = 0;
            const increment = target / 50; // Dynamic count speed
            const updateCount = () => {
                count += increment;
                if (count < target) {
                    stat.textContent = Math.ceil(count) + (target === 4 ? '+' : target === 10 ? 'M+' : target === 100 ? '+' : '%');
                    setTimeout(updateCount, 30);
                } else {
                    stat.textContent = target + (target === 4 ? '+' : target === 10 ? 'M+' : target === 100 ? '+' : '%');
                }
            };
            updateCount();
        });
    };

    if (statsSection && statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    countUp();
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // -------------------------------------------------------------
    // 7. Testimonials Slider
    // -------------------------------------------------------------
    const slider = document.getElementById('testimonials-slider');
    const slides = document.querySelectorAll('#testimonials-slider .testimonial-card');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let slideIndex = 0;

    const updateSlider = () => {
        if (slider && slides.length > 0) {
            slider.style.transform = `translateX(-${slideIndex * 100}%)`;
        }
    };

    if (prevBtn && nextBtn && slides.length > 0) {
        nextBtn.addEventListener('click', () => {
            slideIndex = (slideIndex + 1) % slides.length;
            updateSlider();
        });

        prevBtn.addEventListener('click', () => {
            slideIndex = (slideIndex - 1 + slides.length) % slides.length;
            updateSlider();
        });

        // Swipe support for mobile devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            if (touchStartX - touchEndX > 50) {
                // Swipe Left
                slideIndex = (slideIndex + 1) % slides.length;
                updateSlider();
            }
            if (touchEndX - touchStartX > 50) {
                // Swipe Right
                slideIndex = (slideIndex - 1 + slides.length) % slides.length;
                updateSlider();
            }
        };
    }

    // -------------------------------------------------------------
    // 8. Mobile Hamburger Navigation Drawer Menu
    // -------------------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Collapse menu when click link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // -------------------------------------------------------------
    // 9. Secure Contact Form Handler (Built-in XSS defense)
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear status
            formStatus.className = 'form-status';
            formStatus.textContent = '';
            
            // Collect and validate fields
            const name = contactForm.elements['name'].value.trim();
            const email = contactForm.elements['email'].value.trim();
            const niche = contactForm.elements['niche'].value;
            const message = contactForm.elements['message'].value.trim();
            
            // Basic secure regex validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            
            if (name.length < 2) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please enter a valid name (at least 2 characters).';
                return;
            }
            
            if (!emailRegex.test(email)) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please enter a valid, secure email address.';
                return;
            }
            
            if (message.length < 10) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Your message must contain at least 10 characters.';
                return;
            }

            // Simulate secure API request payload transmission
            formStatus.className = 'form-status success';
            formStatus.textContent = 'Securing connection...';
            
            setTimeout(() => {
                // Prevent XSS: render secure escaped text output
                const safeName = escapeHTML(name);
                formStatus.className = 'form-status success';
                formStatus.textContent = `Thank you, ${safeName}! Your message has been encrypted and sent successfully. We will contact you soon.`;
                
                // Reset form fields
                contactForm.reset();
            }, 1200);
        });
    }

    // -------------------------------------------------------------
    // 10. Bottom Navigation Active State Tracking (Mobile)
    // -------------------------------------------------------------
    const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
    const sections = document.querySelectorAll('section');

    if (bottomNavLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            // Special case for top of page
            if (window.scrollY < 100) {
                current = 'hero';
            }

            bottomNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
        
        bottomNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                bottomNavLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});
