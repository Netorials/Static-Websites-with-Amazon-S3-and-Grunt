module.exports = function(grunt) {
 
 /**
  * Determine the environent to use, based on the "env" commandline option, then load the corresponding
  * environment-specific configuration file.
  */
  var envToUse = grunt.option('env') || 'staging';
  var env = require('./_environments/' + envToUse + '.js');

  /**
   * Load the S3 configuration file   
   */
  var s3 = require('./_config/s3.js')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    releaseDirectory: 'releases/<%= pkg.version %>-' + envToUse,    
    clean: {
      release : [
        '<%= releaseDirectory %>/'
      ]
    },    
    copy: {      
      release:{
        files: [
          {
            expand: true, 
            cwd: 'src/', 
            src:['**'], 
            dest: '<%= releaseDirectory %>/'
          }
        ]
      }
    },    
    aws_s3: {
      release: {
        options: {
          accessKeyId: s3.accessKeyId,          
          secretAccessKey: s3.secretAccessKey,
          bucket: env.s3.bucket,    
          region: env.s3.region,        
          sslEnabled: false
        },
        files: [
          { 
            expand: true, 
            dest: '.', 
            cwd: '<%= releaseDirectory %>/', 
            src: ['**'], 
            action: 'upload', 
            differential: true 
          },          
          { 
            dest: '/', 
            cwd: '<%= releaseDirectory %>/', 
            action: 'delete', 
            differential: true 
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-aws-s3');  
  
  grunt.registerTask(    
    'deploy', 
    [
      'clean:release',
      'copy:release', 
      'aws_s3'
    ]
  );

};