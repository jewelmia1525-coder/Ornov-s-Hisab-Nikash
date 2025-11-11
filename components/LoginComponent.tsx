import React, { useState, useEffect, useRef } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { AdminUser } from '../types';

interface LoginComponentProps {
    onLogin: (username: string, password: string) => boolean;
    adminUsers: AdminUser[];
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.575M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);


const LoginComponent: React.FC<LoginComponentProps> = ({ onLogin, adminUsers, showToast }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotModalOpen, setForgotModalOpen] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

     // Particle Animation Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray: any[];

        class Particle {
            x: number;
            y: number;
            directionX: number;
            directionY: number;
            size: number;
            color: string;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.directionX = Math.random() * 0.4 - 0.2;
                this.directionY = Math.random() * 0.4 - 0.2;
                this.size = Math.random() * 2 + 1;
                const primaryColor = getComputedStyle(document.body).getPropertyValue('--color-primary').trim();
                // This handles various HSL string formats from different browsers (e.g. with/without commas)
                const parts = primaryColor.replace(/,/g, '').split(' ').filter(Boolean);
                const [h, s, l] = parts;
                this.color = `hsla(${h}, ${s}, ${l}, 0.5)`;
            }

            draw() {
                if(!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 12000;
            if (numberOfParticles > 100) numberOfParticles = 100;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        let animationFrameId: number;
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if(!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        const handleResize = () => {
            if(!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    handleResize();
                }
            });
        });

        observer.observe(document.body, { attributes: true });
        window.addEventListener('resize', handleResize);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay for better UX
        setTimeout(() => {
            const success = onLogin(username, password);
            if (!success) {
                setError('ভুল ইউজারনেম বা পাসওয়ার্ড।');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <>
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 opacity-40"></canvas>
            <div className="fixed inset-0 bg-base-100/70 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                <div className="bg-base-200/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center animate-fade-in-up">
                    <img src="https://i.postimg.cc/brTGQ2wL/rsz-1unnamed.jpg" alt="Profile" className="w-24 h-24 rounded-full border-4 border-primary mx-auto mb-4 shadow-lg shadow-primary/20" />
                    <h2 className="font-bangla text-2xl font-bold text-primary mb-6">ফ্যামিলি হিসাব/নিকাশে স্বাগতম</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-base-100 border border-primary/30 rounded-lg text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                                placeholder="User Name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-10 bg-base-100 border border-primary/30 rounded-lg text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                                placeholder="Password"
                                required
                                disabled={isLoading}
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-content hover:text-primary transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {error && <p className="font-bangla text-danger text-sm mb-4">{error}</p>}
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transform hover:-translate-y-1 transition-all shadow-md hover:shadow-lg hover:shadow-primary/30 disabled:bg-primary/70 disabled:cursor-wait"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-content" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Logging in...</span>
                                </div>
                            ) : (
                                'LOGIN'
                            )}
                        </button>
                    </form>
                    <div className="text-right mt-2 -mb-2">
                         <button
                            type="button"
                            onClick={() => setForgotModalOpen(true)}
                            className="text-xs font-semibold text-muted-content hover:text-primary transition-colors hover:underline"
                         >
                            Forgot Password?
                        </button>
                    </div>
                    <div className="font-bangla text-xs text-muted-content bg-base-300/40 p-2 rounded-md mt-5 text-center leading-relaxed">
                        <div>
                            <b>VIEWER LOGIN</b><br />
                            USERNAME: any name<br />
                            PASSWORD: <b>12345</b>
                        </div>
                    </div>
                     <div className="mt-5 pt-4 border-t border-primary/20 text-xs">
                       <a href="https://wa.me/8801402284322" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                         <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.52 3.48A11.87 11.87 0 0012 .6 11.4 11.4 0 00.6 12.08a11.27 11.27 0 001.58 5.83L.6 23.4l5.61-1.47a11.5 11.5 0 005.81 1.53A11.45 11.45 0 0023.4 12a11.87 11.87 0 00-2.88-8.52zM12 21.07a9.29 9.29 0 01-4.74-1.28l-.34-.2-3.33.87.9-3.25-.22-.33A9.22 9.22 0 012.72 12a9.28 9.28 0 1118.56 0A9.28 9.28 0 0112 21.07zm4.84-6.64c-.26-.13-1.54-.76-1.78-.85s-.42-.13-.6.13-.68.85-.83 1-.3.19-.56.06a7.65 7.65 0 01-2.25-1.39 8.43 8.43 0 01-1.56-1.94c-.16-.26 0-.4.12-.53.12-.12.26-.3.4-.45a1.79 1.79 0 00.27-.45.5.5 0 000-.47c-.07-.13-.6-1.44-.83-1.98s-.44-.46-.6-.47h-.51a1 1 0 00-.72.33A3 3 0 007 8.46a5.17 5.17 0 001.1 2.72A11.83 11.83 0 0012 14.68a5.44 5.44 0 001.38.18 3.28 3.28 0 002.13-1.36 2.69 2.69 0 00.33-1.39c0-.26-.02-.46-.06-.64a.47.47 0 00-.14-.22z"/></svg>
                        Full Access Contact
                       </a>
                    </div>
                </div>
            </div>
            <ForgotPasswordModal 
                isOpen={isForgotModalOpen} 
                onClose={() => setForgotModalOpen(false)} 
                adminUsers={adminUsers}
                showToast={showToast}
            />
             <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </>
    );
};

export default LoginComponent;
