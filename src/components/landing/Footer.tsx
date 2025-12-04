export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-white/10 bg-black">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">Dreamary</h3>
                    <p className="text-sm text-white/40">© 2024 Dreamary. All rights reserved.</p>
                </div>

                <div className="flex gap-8 text-sm text-white/60">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
