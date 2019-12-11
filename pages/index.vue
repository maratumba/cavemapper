<template>
  <v-container>
    <v-row>
      <v-col md="6" xs="12"> 
      <v-card>
        <v-card-title>Tools</v-card-title>
        <v-list>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
              <v-list-item-subtitle v-text="item.description" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data: function(){return {
    items: [
        {
          icon: 'mdi-map',
          title: 'Mapper',
          to: '/mapper',
          description: 'Convert cave survey data to 3d point cloud'
        },
      ],
  }}
}
</script>
