import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLanguageSubject = new BehaviorSubject<Language>('en');
    public currentLanguage$: Observable<Language> = this.currentLanguageSubject.asObservable();

    private readonly STORAGE_KEY = 'workshop_language';
    private readonly RTL_LANGUAGES: Language[] = ['ar'];

    constructor(private translate: TranslateService) {
        this.initializeLanguage();
    }

    private initializeLanguage(): void {
        // Get saved language or default to English
        const savedLanguage = this.getSavedLanguage();
        this.setLanguage(savedLanguage);
    }

    private getSavedLanguage(): Language {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return (saved === 'ar' || saved === 'en') ? saved : 'en';
    }

    public setLanguage(lang: Language): void {
        this.translate.use(lang);
        this.currentLanguageSubject.next(lang);
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.updateDocumentDirection(lang);
        this.updateDocumentLang(lang);
    }

    public getCurrentLanguage(): Language {
        return this.currentLanguageSubject.value;
    }

    public isRTL(): boolean {
        return this.RTL_LANGUAGES.includes(this.currentLanguageSubject.value);
    }

    public toggleLanguage(): void {
        const newLang: Language = this.currentLanguageSubject.value === 'en' ? 'ar' : 'en';
        this.setLanguage(newLang);
    }

    private updateDocumentDirection(lang: Language): void {
        const direction = this.RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
        document.documentElement.dir = direction;
        document.body.dir = direction;
    }

    private updateDocumentLang(lang: Language): void {
        document.documentElement.lang = lang;
    }
}
