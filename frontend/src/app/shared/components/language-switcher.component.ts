import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from '@core/services/language.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="language-switcher">
      <button class="lang-button" (click)="toggleLanguage()" [title]="'LANGUAGE.SELECT' | translate">
        <span class="material-icons">language</span>
        <span class="lang-text">{{ currentLanguage === 'en' ? 'EN' : 'ع' }}</span>
      </button>
    </div>
  `,
    styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
    }

    .lang-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;

      .material-icons {
        font-size: 20px;
      }

      .lang-text {
        min-width: 24px;
        text-align: center;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  `]
})
export class LanguageSwitcherComponent {
    currentLanguage: Language = 'en';

    constructor(private languageService: LanguageService) {
        this.languageService.currentLanguage$.subscribe(lang => {
            this.currentLanguage = lang;
        });
    }

    toggleLanguage(): void {
        this.languageService.toggleLanguage();
    }
}
