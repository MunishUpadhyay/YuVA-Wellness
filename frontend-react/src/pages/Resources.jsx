
import React, { useState } from 'react';
import {
    Phone, MessageSquare, Heart, Users, Shield, Award,
    AlertTriangle, Activity, UserPlus, BookOpen, ChevronDown, Smartphone
} from 'lucide-react';
import ApiClient from '../services/apiClient';
import styles from '../styles/pages/Resources.module.css';
import { cn } from '../utils/utils';
import PageHeader from '../components/layout/PageHeader';

const Resources = () => {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className={styles.page}>
            <PageHeader
                title="Support Resources"
                subtitle="You're not alone. Find immediate help and comprehensive support."
                icon={Shield}
                color="text-accent-rose"
                orbitColor="border-accent-rose/30"
            />
            <div className={styles.emergencyButtons}>
                <a href="tel:988" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all">
                    <Phone className="mr-2" size={20} /> Emergency: Call 988
                </a>
                <a href="sms:741741" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-red-300 border-2 border-red-500/50 hover:bg-red-500/10 transition-all">
                    <MessageSquare className="mr-2" size={20} /> Text: HOME to 741741
                </a>
            </div>


            <section className={styles.crisisBanner}>
                <div className={styles.crisisContent}>
                    <div className={styles.crisisHeader}>
                        <AlertTriangle className="text-red-400" size={24} />
                        <h2 className={styles.crisisTitle}>Crisis Support Available 24/7</h2>
                    </div>
                    <p className={styles.crisisText}>If you're in immediate danger, please call 911 or go to the nearest emergency room.</p>
                </div>
            </section>

            <div className={styles.container}>
                <section className={styles.helplineGrid}>
                    <HelplineCard
                        title="Suicide & Crisis Lifeline"
                        desc="24/7 Crisis Support"
                        phone="988"
                        text="988"
                        icon={Phone}
                        color="bg-red-600"
                        textColor="text-red-400"
                    />
                    <HelplineCard
                        title="Crisis Text Line"
                        desc="24/7 Text Support"
                        text="Text HOME to 741741"
                        icon={MessageSquare}
                        color="bg-blue-600"
                        textColor="text-blue-400"
                    />
                    <HelplineCard
                        title="NAMI Helpline"
                        desc="General Mental Health"
                        phone="1-800-950-6264"
                        icon={Heart}
                        color="bg-emerald-600"
                        textColor="text-emerald-400"
                    />
                    <HelplineCard
                        title="SAMHSA Helpline"
                        desc="Treatment Referral"
                        phone="1-800-662-4357"
                        icon={Users}
                        color="bg-violet-600"
                        textColor="text-violet-400"
                    />
                    <HelplineCard
                        title="LGBT National Hotline"
                        desc="LGBTQ+ Support"
                        phone="1-888-843-4564"
                        icon={Award}
                        color="bg-pink-600"
                        textColor="text-pink-400"
                    />
                    <HelplineCard
                        title="Veterans Crisis Line"
                        desc="Veteran Support"
                        phone="988 (Press 1)"
                        text="838255"
                        icon={Shield}
                        color="bg-amber-600"
                        textColor="text-amber-400"
                    />
                </section>
            </div>

            <section className="bg-surface/30">
                <div className={styles.container}>
                    <div className={styles.actionGrid}>
                        <ActionCard
                            title="If You're Having Suicidal Thoughts"
                            icon={AlertTriangle}
                            headerColor="text-red-400"
                            iconBg="bg-red-600"
                        >
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-red-300 mb-2">Immediate Actions:</h4>
                                <ul className="space-y-2 text-sm text-red-200/80">
                                    <li className="flex items-center"><Phone size={14} className="mr-2" /> Call 988 immediately</li>
                                    <li className="flex items-center"><Users size={14} className="mr-2" /> Reach out to a trusted person</li>
                                    <li className="flex items-center"><Shield size={14} className="mr-2" /> Go to emergency room</li>
                                </ul>
                            </div>
                            <p className="text-sm text-slate-400">Remember: These feelings are temporary. Help is available.</p>
                        </ActionCard>

                        <ActionCard
                            title="During a Panic Attack"
                            icon={Activity}
                            headerColor="text-orange-400"
                            iconBg="bg-orange-600"
                        >
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-orange-300 mb-2">5-4-3-2-1 Grounding:</h4>
                                <ul className="space-y-1 text-sm text-orange-200/80">
                                    <li>5 things you can see</li>
                                    <li>4 things you can touch</li>
                                    <li>3 things you can hear</li>
                                    <li>2 things you can smell</li>
                                    <li>1 thing you can taste</li>
                                </ul>
                            </div>
                            <p className="text-sm text-slate-400">Breathe: In for 4, Hold for 4, Out for 4.</p>
                        </ActionCard>
                    </div>
                </div>
            </section>

            <div className={styles.container}>
                <section className={styles.accordionSection}>
                    <h2 className="text-3xl font-bold text-center text-white mb-8">Mental Health Resources</h2>

                    <ResourceAccordion
                        title="Professional Help"
                        subtitle="Find therapists & psychiatrists"
                        icon={UserPlus}
                        gradient="from-primary to-accent-violet"
                        isOpen={expandedSection === 'professional'}
                        onToggle={() => toggleSection('professional')}
                    >
                        <ul className="space-y-3 text-slate-300">
                            <li><a href="https://www.psychologytoday.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Psychology Today</a> - Therapist directory</li>
                            <li><a href="https://www.betterhelp.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BetterHelp</a> - Online therapy</li>
                            <li>Check your insurance provider's directory for covered specialists.</li>
                        </ul>
                    </ResourceAccordion>

                    <ResourceAccordion
                        title="Support Groups"
                        subtitle="Connect with others"
                        icon={Users}
                        gradient="from-wellness-500 to-accent-teal"
                        isOpen={expandedSection === 'support'}
                        onToggle={() => toggleSection('support')}
                    >
                        <ul className="space-y-3 text-slate-300">
                            <li><a href="https://www.nami.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">NAMI Support Groups</a></li>
                            <li><a href="https://www.7cups.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">7 Cups</a> - Free emotional support</li>
                        </ul>
                    </ResourceAccordion>

                    <ResourceAccordion
                        title="Self-Help Tools"
                        subtitle="Apps & Books"
                        icon={BookOpen}
                        gradient="from-amber-500 to-orange-500"
                        isOpen={expandedSection === 'selfhelp'}
                        onToggle={() => toggleSection('selfhelp')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                            <div>
                                <h4 className="font-semibold text-white mb-2 flex items-center"><Smartphone size={16} className="mr-2" /> Apps</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Headspace (Meditation)</li>
                                    <li>Calm (Sleep & Relax)</li>
                                    <li>Insight Timer (Free)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2 flex items-center"><BookOpen size={16} className="mr-2" /> Books</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>"Feeling Good" by David Burns</li>
                                    <li>"The Body Keeps the Score"</li>
                                </ul>
                            </div>
                        </div>
                    </ResourceAccordion>
                </section>

                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4">
                                <UserPlus className="text-primary" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">When to Seek Professional Help</h2>
                            <p className="text-slate-400">Recognizing when it's time to reach out.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <AlertTriangle className="text-red-400 mr-2" size={20} />
                                    Immediate Help Needed
                                </h3>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2"></span>Thoughts of suicide or self-harm</li>
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2"></span>Severe depression lasting weeks</li>
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2"></span>Panic attacks interfering with life</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Heart className="text-emerald-400 mr-2" size={20} />
                                    Consider Support
                                </h3>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 mr-2"></span>Persistent sadness</li>
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 mr-2"></span>Difficulty managing stress</li>
                                    <li className="flex items-start"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 mr-2"></span>Sleep problems</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div >
    );
};

const HelplineCard = ({ title, desc, phone, text, icon: Icon, color, textColor }) => (
    <div className={styles.helplineCard}>
        <div className={styles.helplineHeader}>
            <div className={cn(styles.helplineIcon, color)}>
                <Icon className="text-white" size={24} />
            </div>
            <div>
                <h3 className={styles.helplineTitle}>{title}</h3>
                <p className={styles.helplineDesc}>{desc}</p>
            </div>
        </div>
        <div className="space-y-2 text-sm">
            {phone && <div className="flex justify-between items-center bg-black/20 p-2 rounded"><span className="text-slate-400">Phone:</span> <a href={`tel:${phone} `} className={cn("font-bold hover:underline", textColor)}>{phone}</a></div>}
            {text && <div className="flex justify-between items-center bg-black/20 p-2 rounded"><span className="text-slate-400">Text:</span> <a href={`sms:${text.replace(/\D/g, '')} `} className={cn("font-bold hover:underline", textColor)}>{text}</a></div>}
        </div>
    </div>
);

const ActionCard = ({ title, icon: Icon, headerColor, iconBg, children }) => (
    <div className={styles.actionCard}>
        <div className={styles.actionHeader}>
            <div className={cn(styles.actionIcon, iconBg)}>
                <Icon className="text-white" size={24} />
            </div>
            <h3 className={cn("text-xl font-bold", headerColor)}>{title}</h3>
        </div>
        {children}
    </div>
);

const ResourceAccordion = ({ title, subtitle, icon: Icon, gradient, isOpen, onToggle, children }) => (
    <div className={styles.accordion}>
        <button onClick={onToggle} className={styles.accordionBtn}>
            <div className="flex items-center space-x-4">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg", gradient)}>
                    <Icon className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white text-left">{title}</h3>
                    <p className="text-slate-400 text-sm text-left">{subtitle}</p>
                </div>
            </div>
            <ChevronDown className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} size={20} />
        </button>
        {isOpen && (
            <div className={styles.accordionContent}>
                {children}
            </div>
        )}
    </div>
);

export default Resources;
