import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function LearnMorePage() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-black">{t('about_us')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('our_mission')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('mission_text')}
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('our_team')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('team_text')}
          </p>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">{t('company_history')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('history_text')}
          </p>
        </div>
      </div>
    </div>
  )
}
